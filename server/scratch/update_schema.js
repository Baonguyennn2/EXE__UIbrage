const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function updateSchema() {
  const qi = sequelize.getQueryInterface();
  try {
    // 1. Check/Add categoryId to Assets
    console.log('Checking Assets table...');
    const assetTable = await qi.describeTable('Assets');
    if (!assetTable.categoryId) {
      console.log('Adding categoryId to Assets...');
      await qi.addColumn('Assets', 'categoryId', {
        type: DataTypes.INTEGER,
        allowNull: true
      });
    }

    // 2. Check/Add type to Categories
    console.log('Checking Categories table...');
    const catTable = await qi.describeTable('Categories');
    if (!catTable.type) {
      console.log('Adding type to Categories...');
      await qi.addColumn('Categories', 'type', {
        type: DataTypes.STRING,
        defaultValue: 'ui-style'
      });
    }

    // 3. Ensure AssetTags table exists
    console.log('Ensuring AssetTags table exists...');
    await sequelize.sync();

    console.log('Local Schema successfully updated.');
    process.exit(0);
  } catch (error) {
    console.error('Schema Update Error:', error);
    process.exit(1);
  }
}

updateSchema();
