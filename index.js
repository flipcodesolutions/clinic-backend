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

    await new Promise((resolve, reject) => {
      const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        resolve(server);
      });
      server.on('error', reject);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message || error);
    if (error.parent) console.error('DB error:', error.parent.message || error.parent);
    if (error.errors) console.error('Details:', error.errors);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in .env`);
    }
    process.exit(1);
  }
}

start();
