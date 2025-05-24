const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const adminRoutes = require('./admin');
const userRoutes = require('./user');
const commonRoutes = require('./common');
const db = require('./db');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/common', commonRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});