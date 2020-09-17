const jwt = require('jsonwebtoken');
const config    =   require('../../config');
const {getSession} =   require('../../dbConnector');


class UserService {
    async isAuthenticated(token) {
        try {
            jwt.verify(token, config.jwtSecret);
            return Promise.resolve(true);
        } catch(e) {
            return Promise.reject(false);
        }
    }
    async createUser (email, password) {
        try {

            if(!email || !password) {
                return Promise.reject(false);
            }

            const session   =   await getSession
            const row = await session.getSchema('elem').getTable('users')
                .insert(['email', 'password'])
                .values([email, password])
                .execute();
            return Promise.resolve(row.getAffectedItemsCount());
        } catch (e) {
            console.log(e)
            return Promise.reject(e);
        }
    }
    async loginUser (email, password) {
        try {
            if(!email || !password) {
                return Promise.reject(false);
            }

            const session   =   await getSession
            const row = await session.getSchema('elem').getTable('users')
                .select(['id', 'email', 'password', 'role'])
                .where(`email = :email AND password = :password`)
                .bind('email', email)
                .bind('password', password)
                .execute();

            const user  =   row.fetchOne();

            session.getSchema('elem').getTable('online_users')
                .insert(['userId', 'online'])
                .values([user[0], 1])
                .execute();


            const payload   =   {
                email: user[1],
                role: user[3]
            }

            const token = jwt.sign(payload, config.jwtSecret);
            return Promise.resolve({token});
        } catch (e) {
            console.log(e)
            return Promise.reject(e);
        }
    }

    userInfo (token) {
        if(this.isAuthenticated(token)) {
            try {
                const decoded = jwt.verify(token, config.jwtSecret);
                delete decoded.iat;
                return decoded;
            } catch(e) {
                return e;
            }
        } else {
            return false;
        }
    }
}


module.exports = UserService;