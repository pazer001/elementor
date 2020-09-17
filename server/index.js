require('dotenv').config();
const express   =   require(`express`);
const bodyParser = require('body-parser');
const config    =   require('./config');
const UserService    =   require('./services/Users/UserService');
const PORT  =   config.server.port;

const app   =   express();
app.use(bodyParser.json());


const userService   =   new UserService();

app.post('/v1/users', async (req, res) => {
   const email  =   req.body.email;
   const password  =   req.body.password;


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
    const email  =   req.body.email;
    const password  =   req.body.password;


    try {
        const result    =   await userService.loginUser(email, password);
        res.json(result);
    } catch (e) {
        res.status(401).json({
            message: 'Failed to login user'
        });
    }
});

app.listen(PORT, () => console.info(`App is listening to port ${PORT}.`))


