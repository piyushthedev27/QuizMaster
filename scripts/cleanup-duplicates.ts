import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up duplicate quiz attempts...');
  
  // Find all attempts grouped by userId, score, accuracy, timeTaken
  const attempts = await prisma.quizAttempt.findMany({
    orderBy: { createdAt: 'asc' }
  });

  const uniqueKeys = new Set();
  const toDelete = [];

  for (const attempt of attempts) {
    // Create a unique key based on data (approximate since we don't have sessionId yet)
    const key = `${attempt.userId}-${attempt.score}-${attempt.accuracy}-${attempt.timeTaken}-${JSON.stringify(attempt.answers)}`;
    
    if (uniqueKeys.has(key)) {
      toDelete.push(attempt.id);
    } else {
      uniqueKeys.add(key);
    }
  }

  console.log(`Found ${toDelete.length} duplicates to delete.`);

  if (toDelete.length > 0) {
    for (const id of toDelete) {
      await prisma.quizAttempt.delete({ where: { id } });
    }
    console.log('Cleanup complete.');
  } else {
    console.log('No duplicates found.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
