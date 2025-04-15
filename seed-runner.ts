import { seedChennaiRestaurants } from './seed';

// Run the seed function
async function runSeed() {
  try {
    await seedChennaiRestaurants();
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running seed:', error);
    process.exit(1);
  }
}

runSeed();