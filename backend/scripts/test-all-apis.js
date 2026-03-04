const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:3001';
const API_TEST_TOKEN = process.env.API_TEST_TOKEN || '';
const REQUEST_TIMEOUT = Number(process.env.API_TEST_TIMEOUT_MS || 15000);

// Use a valid CUID-shaped placeholder so Prisma doesn't throw a format validation
// error (which returns 500). The DB will return 404 (not found) instead.
const FAKE_ID = 'clzzzzzzzzzzzzzzzzzzzzzzz';

function buildUrl(pathTemplate) {
  return pathTemplate
    .replace(/\{repoId\}/g, FAKE_ID)
    .replace(/\{repositoryId\}/g, FAKE_ID)
    .replace(/\{issueId\}/g, FAKE_ID)
    .replace(/\{commentId\}/g, FAKE_ID)
    .replace(/\{categoryId\}/g, FAKE_ID)
    .replace(/\{id\}/g, FAKE_ID);
}

function getRequestBody(method) {
  if (method === 'post' || method === 'put' || method === 'patch') {
    return {};
  }
  return undefined;
}

function isValidStatus(status, hasPathParams) {
  if (!hasPathParams && status === 404) {
    return false;
  }

  if (status >= 200 && status < 500) {
    return true;
  }
  return false;
}

async function testAllApis() {
  console.log(`\n🔎 Fetching Swagger schema from ${BASE_URL}/api-docs.json`);

  const schemaResponse = await axios.get(`${BASE_URL}/api-docs.json`, {
    timeout: REQUEST_TIMEOUT,
  });

  const paths = schemaResponse.data?.paths || {};
  const tests = [];

  Object.entries(paths).forEach(([path, methods]) => {
    Object.keys(methods).forEach((method) => {
      const normalizedMethod = method.toLowerCase();
      if (['get', 'post', 'put', 'patch', 'delete'].includes(normalizedMethod)) {
        tests.push({ method: normalizedMethod, path });
      }
    });
  });

  console.log(`📚 Total API routes discovered from Swagger: ${tests.length}`);

  if (tests.length === 0) {
    throw new Error('No API routes found in Swagger schema');
  }

  const failures = [];
  let passed = 0;

  for (const test of tests) {
    const resolvedPath = buildUrl(test.path);
    const targetUrl = `${BASE_URL}${resolvedPath}`;
    const hasPathParams = /\{.+\}/.test(test.path);

    try {
      const response = await axios({
        method: test.method,
        url: targetUrl,
        timeout: REQUEST_TIMEOUT,
        data: getRequestBody(test.method),
        headers: {
          ...(API_TEST_TOKEN ? { Authorization: `Bearer ${API_TEST_TOKEN}` } : {}),
        },
        validateStatus: () => true,
      });

      if (!isValidStatus(response.status, hasPathParams)) {
        failures.push({
          method: test.method.toUpperCase(),
          path: test.path,
          status: response.status,
        });
        console.log(`❌ ${test.method.toUpperCase()} ${test.path} -> ${response.status}`);
      } else {
        passed += 1;
        console.log(`✅ ${test.method.toUpperCase()} ${test.path} -> ${response.status}`);
      }
    } catch (error) {
      failures.push({
        method: test.method.toUpperCase(),
        path: test.path,
        status: 'REQUEST_FAILED',
        message: error.message,
      });
      console.log(`❌ ${test.method.toUpperCase()} ${test.path} -> REQUEST_FAILED (${error.message})`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failures.length}/${tests.length}`);

  if (failures.length > 0) {
    console.log('\nFailed endpoints:');
    failures.forEach((failure) => {
      console.log(`- ${failure.method} ${failure.path} -> ${failure.status}`);
    });
    process.exit(1);
  }

  console.log('\n🎉 API smoke test completed successfully.');
}

testAllApis().catch((error) => {
  console.error('\n💥 API smoke test crashed:', error.message);
  process.exit(1);
});
