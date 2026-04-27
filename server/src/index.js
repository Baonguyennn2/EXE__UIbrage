const app = require('./app');
const sequelize = require('./config/database');
const connectMongoDB = require('./config/mongodb');
require('./models/mysql'); // Load relations

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MySQL
    await sequelize.authenticate();
    console.log('MySQL connected successfully');

    // Sync MySQL models (In production, use migrations)
    await sequelize.sync();
    console.log('MySQL models synchronized');

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
