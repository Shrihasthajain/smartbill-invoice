const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const itemRoutes = require('./routes/itemRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/items', itemRoutes);
app.use('/api/invoices', invoiceRoutes);

app.get('/', (req, res) => res.send('HealthyChef Invoice API Running'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));