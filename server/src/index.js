const app = require('./app');
const sequelize = require('./config/database');
const connectMongoDB = require('./config/mongodb');
require('./models/mysql'); // Load relations
const seed = require('./seeders');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MySQL
    await sequelize.authenticate();
    console.log('MySQL connected successfully');

    // Sync MySQL models (In production, use migrations)
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Clean up orphaned categoryIds in Assets before re-enabling constraints
    await sequelize.query('UPDATE Assets SET categoryId = NULL WHERE categoryId NOT IN (SELECT id FROM Categories)');
    
    await sequelize.sync({ alter: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('MySQL models synchronized');

    // Seed initial data
    await seed();

    // Connect to MongoDB
    await connectMongoDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

startServer();
