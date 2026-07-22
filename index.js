require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { syncDatabase } = require('./models');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin');
const doctorRoutes = require('./routes/doctor');
const patientRoutes = require('./routes/patient');
const receptionistRoutes = require('./routes/receptionist');
const caretakerRoutes = require('./routes/caretaker');
const staffRoutes = require('./routes/staff');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'Clinic API Docs',
}));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/caretaker', caretakerRoutes);
app.use('/api/staff', staffRoutes);

async function start() {
  try {
    await syncDatabase({ alter: process.env.DB_SYNC_ALTER === 'true' });

    await new Promise((resolve, reject) => {
      const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
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
