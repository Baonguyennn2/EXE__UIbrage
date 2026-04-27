const sequelize = require('../src/config/database');

async function dropRedundantIndexes() {
  try {
    const [results] = await sequelize.query("SHOW INDEX FROM Users");
    const indexesToDrop = results
      .filter(idx => idx.Key_name !== 'PRIMARY')
      .map(idx => idx.Key_name);

    // Filter for unique keys to drop
    const uniqueKeys = [...new Set(indexesToDrop)];
    
    for (const key of uniqueKeys) {
      console.log(`Dropping index ${key}...`);
      await sequelize.query(`ALTER TABLE Users DROP INDEX ${key}`);
    }

    console.log('Finished dropping redundant indexes.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

dropRedundantIndexes();
