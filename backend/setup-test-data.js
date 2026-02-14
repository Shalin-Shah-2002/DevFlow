const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupTestData() {
  try {
    console.log('🔧 Setting up test data...\n');

    // Create or update test user
    const user = await prisma.user.upsert({
      where: { id: 'test-user-123' },
      update: {
        email: 'test@example.com',
        githubId: 123456,
        githubLogin: 'testuser',
        accessToken: 'test_token', // This will cause the API to return proper error
        avatar: 'https://avatars.githubusercontent.com/u/123456',
      },
      create: {
        id: 'test-user-123',
        email: 'test@example.com',
        githubId: 123456,
        githubLogin: 'testuser',
        accessToken: 'test_token',
        avatar: 'https://avatars.githubusercontent.com/u/123456',
      },
    });

    console.log('✅ Test user created/updated:',user.email);

    // Create a test repository
    const repo = await prisma.repository.upsert({
      where: { githubId: 10270250 },
      update: {
        name: 'react',
        fullName: 'facebook/react',
        description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
        url: 'https://github.com/facebook/react',
        owner: 'facebook',
        isPrivate: false,
        language: 'JavaScript',
        stars: 200000,
        forks: 40000,
        openIssuesCount: 1000,
        lastSyncedAt: new Date(),
      },
      create: {
        githubId: 10270250,
        name: 'react',
        fullName: 'facebook/react',
        description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
        url: 'https://github.com/facebook/react',
        owner: 'facebook',
        isPrivate: false,
        language: 'JavaScript',
        stars: 200000,
        forks: 40000,
        openIssuesCount: 1000,
        lastSyncedAt: new Date(),
      },
    });

    console.log('✅ Test repository created/updated:', repo.fullName);

    // Link user to repository
    const userRepo = await prisma.userRepository.upsert({
      where: {
        userId_repositoryId: {
          userId: user.id,
          repositoryId: repo.id,
        },
      },
      update: {
        role: 'admin',
        group: 'Test Group',
      },
      create: {
        userId: user.id,
        repositoryId: repo.id,
        role: 'admin',
        group: 'Test Group',
      },
    });

    console.log('✅ User linked to repository');
    console.log('\n📊 Test Data Summary:');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Repository ID: ${repo.id}`);
    console.log(`   Repository: ${repo.fullName}`);
    console.log('\n✨ Test data setup complete!\n');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

setupTestData();
