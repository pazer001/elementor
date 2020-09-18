require('dotenv').config();
const express = require(`express`);
const bodyParser = require('body-parser');
const config = require('./config');
const jwt = require('jsonwebtoken');
const cors  =   require('cors');
const UserService = require('./services/Users/UserService');
const PORT = config.server.port;

const app = express();
app.use(bodyParser.json());
app.use(cors());

const userService = new UserService();

const authenticateToken = (req, res, next) => {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    try {
        req.user = jwt.verify(token, config.jwtSecret)
        next()
    } catch (e) {
        console.log(e);
        return res.sendStatus(403);
    }
}

app.post('/v1/users', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        await userService.createUser(email, password);
        res.json({
            message: 'User created'
        });
    } catch (e) {
        res.status(400).json({
            message: 'Failed to create user'
        });
    }
});

app.post('/v1/oauth/token', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;


    try {
        const result = await userService.loginUser(email, password);
        res.json(result);
    } catch (e) {
        res.status(401).json({
            message: 'Failed to login user'
        });
    }
});

app.get('/v1/users/info', authenticateToken, async (req, res) => {
    try {
        const result = await userService.userInfo(req.user);
        res.json(result);
    } catch (e) {
        res.status(400).json({
            message: 'Failed to user info'
        });
    }
});
app.get('/v1/users/online', authenticateToken, async (req, res) => {
    try {
        const result = await userService.onlineUsers(req.user);
        res.json(result);
    } catch (e) {
        res.status(400).json({
            message: 'Failed to get online user'
        });
    }
});

app.post('/v1/users/logout', authenticateToken, async (req, res) => {
    try {
        const result = await userService.logoutUser(req.user);
        res.json(result);
    } catch (e) {
        res.status(400).json({
            message: 'Failed to logout user'
        });
    }
});


app.listen(PORT, () => console.info(`App is listening to port ${PORT}.`))


