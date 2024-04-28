require('dotenv').config();
const express = require('express');
const routesUser = require('./routes/routerUser');
const routesAdmin = require('./routes/routerAdmin');

const app = express();

app.use(express.json());
app.use(routesUser);
app.use(routesAdmin);

app.listen(3000, () => console.log('Server running'));
