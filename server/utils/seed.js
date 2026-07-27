const mongoose = require('mongoose');
const dotenv = require('dotenv');
const autoSeedDB = require('./autoSeed');

dotenv.config({ path: __dirname + '/../.env' });

const seedCLI = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed CLI] Connected to MongoDB...');

    // Run independent auto-seeder
    await autoSeedDB();

    console.log('[Seed CLI] Execution finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed CLI Error] Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedCLI();
