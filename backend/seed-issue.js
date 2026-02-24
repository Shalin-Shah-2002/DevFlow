const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function go() {
  const repo = await p.repository.findFirst({ where: { fullName: 'facebook/react' } });
  const issue = await p.issue.create({
    data: {
      githubId: 123001,
      number: 1,
      title: 'Test: Dark mode support',
      body: 'Add dark mode toggle to dashboard',
      state: 'open',
      priority: 'P1',
      repositoryId: repo.id,
      githubCreatedAt: new Date(),
      githubUpdatedAt: new Date(),
    },
  });
  console.log('Issue ID:', issue.id);
  await p.$disconnect();
}

go().catch(console.error);
