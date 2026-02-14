const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = 'your_super_secret_jwt_key_change_this_in_production';
const BASE_URL = 'http://localhost:3001';

// Generate a test token
const token = jwt.sign(
  { id: 'test-user-123', email: 'test@example.com', githubId: 123456 },
  JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('\n🔑 Generated JWT Token:');
console.log(token);
console.log('\n');

async function testAPIs() {
  try {
    console.log('📝 Testing Repository APIs\n');
    console.log('=' .repeat(60));

    // Test 1: Try to create a repository first
    console.log('\n1. Testing POST /api/repositories (Add Repository)');
    console.log('-'.repeat(60));
    try {
      const addRepoResponse = await axios.post(
        `${BASE_URL}/api/repositories`,
        {
          repoUrl: 'https://github.com/facebook/react',
          group: 'Test Group'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Status:', addRepoResponse.status);
      console.log('Response:', JSON.stringify(addRepoResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    }

    // Test 2: Get all repositories
    console.log('\n2. Testing GET /api/repositories (List Repositories)');
    console.log('-'.repeat(60));
    try {
      const listResponse = await axios.get(`${BASE_URL}/api/repositories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Status:', listResponse.status);
      console.log('Repositories found:', listResponse.data.data?.length || 0);
      if (listResponse.data.data && listResponse.data.data.length > 0) {
        const repoId = listResponse.data.data[0].id;
        console.log('First repository ID:', repoId);
        
        // Test 3: Sync the repository
        console.log('\n3. Testing POST /api/repositories/{id}/sync');
        console.log('-'.repeat(60));
        try {
          const syncResponse = await axios.post(
            `${BASE_URL}/api/repositories/${repoId}/sync`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log('✅ Status:', syncResponse.status);
          console.log('Response:', JSON.stringify(syncResponse.data, null, 2));
        } catch (error) {
          console.log('❌ Error:', error.response?.status);
          console.log('Response:', JSON.stringify(error.response?.data, null, 2));
        }

        // Test 4: Setup webhook
        console.log('\n4. Testing POST /api/repositories/{id}/webhook');
        console.log('-'.repeat(60));
        try {
          const webhookResponse = await axios.post(
            `${BASE_URL}/api/repositories/${repoId}/webhook`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log('✅ Status:', webhookResponse.status);
          console.log('Response:', JSON.stringify(webhookResponse.data, null, 2));
        } catch (error) {
          console.log('❌ Error:', error.response?.status);
          console.log('Response:', JSON.stringify(error.response?.data, null, 2));
        }
      }
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    }

    // Test with invalid repo ID
    console.log('\n5. Testing with invalid repository ID');
    console.log('-'.repeat(60));
    try {
      const syncResponse = await axios.post(
        `${BASE_URL}/api/repositories/invalid-repo-id/sync`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Status:', syncResponse.status);
    } catch (error) {
      console.log('❌ Error:', error.response?.status);
      console.log('Response:', JSON.stringify(error.response?.data, null, 2));
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✨ Testing Complete!\n');

  } catch (error) {
    console.error('\n💥 Fatal Error:', error.message);
  }
}

testAPIs();
