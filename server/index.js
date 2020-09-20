require('dotenv').config();
const express = require(`express`);
const bodyParser = require('body-parser');
const config = require('./config');
const cors = require('cors');
const UsersController = require('./controllers/Users/UsersController')

const PORT = config.server.port;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(UsersController)



app.use(express.static('../front'));

app.listen(PORT, () => console.info(`App is listening to port ${PORT}.`))


