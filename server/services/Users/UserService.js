const jwt = require('jsonwebtoken');
const config    =   require('../../config');
const {getSession} =   require('../../dbConnector');


class UserService {
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
                .select(['email', 'password', 'role'])
                .where(`email = :email AND password = :password`)
                .bind('email', email)
                .bind('password', password)
                .execute();

            const data  =   row.fetchOne();
            const payload   =   {
                email: data[0],
                role: data[2]
            }

            const token = jwt.sign(payload, config.jwtSecret);
            return Promise.resolve({token});
        } catch (e) {
            console.log(e)
            return Promise.reject(e);
        }
    }

    async userInfo (token) {
        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            delete decoded.iat;

            return Promise.resolve(decoded);
        } catch(e) {
            return Promise.reject(e);
        }

    }
}


module.exports = UserService;