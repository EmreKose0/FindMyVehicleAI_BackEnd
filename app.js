const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');

const app = express();


app.use(cors());
app.use(express.json());


app.use('/api/ai', aiRoutes);


module.exports = app;