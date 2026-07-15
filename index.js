require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, syncDatabase } = require('./models');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);

async function start() {
  try {
    await syncDatabase({ alter: process.env.DB_SYNC_ALTER === 'true' });
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
