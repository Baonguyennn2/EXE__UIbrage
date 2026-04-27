const sequelize = require('../src/config/database');

async function checkIndexes() {
  try {
    const [results] = await sequelize.query("SHOW INDEX FROM Users");
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkIndexes();
