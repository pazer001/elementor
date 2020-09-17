const jwt = require('jsonwebtoken');
const config = require('../../config');
const {getSession} = require('../../dbConnector');


class UserService {
    async isAuthenticated(token) {
        try {
            jwt.verify(token, config.jwtSecret);
            return Promise.resolve(true);
        } catch (e) {
            return Promise.reject(false);
        }
    }

    async createUser(email, password) {
        try {

            if (!email || !password) {
                return Promise.reject(false);
            }

            const session = await getSession
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

    async loginUser(email, password) {
        try {
            if (!email || !password) {
                return Promise.reject(false);
            }

            const session = await getSession
            const row = await session.getSchema('elem').getTable('users')
                .select(['id', 'email', 'password', 'role'])
                .where(`email = :email AND password = :password`)
                .bind('email', email)
                .bind('password', password)
                .execute();

            const user = row.fetchOne();
            const payload = {
                id: user[0],
                email: user[1],
                role: user[3]
            }

            session.getSchema('elem').getTable('online_users')
                .insert(['userId'])
                .values([payload.id])
                .execute();




            const token = jwt.sign(payload, config.jwtSecret);
            return Promise.resolve({token});
        } catch (e) {
            console.log(e)
            return Promise.reject(e);
        }
    }

    userInfo(token) {
        if (this.isAuthenticated(token)) {
            try {
                const decoded = jwt.verify(token, config.jwtSecret);
                delete decoded.iat;
                return decoded;
            } catch (e) {
                return e;
            }
        } else {
            return false;
        }
    }

    async onlineUsers(token) {
        if (this.isAuthenticated(token)) {
            try {
                const session = await getSession
                const results = await session.sql(`SELECT users.email, users.role, online_users.timestamp FROM elem.online_users 
                                                        JOIN elem.users ON online_users.userId = users.id
                                                        WHERE online_users.timestamp >= NOW() - INTERVAL 20 MINUTE;`)
                    .execute();

                const onlineUsers =   results.fetchAll().map(user => ({email: user[0], role: user[1], timestamp: user[2]}));

                return Promise.resolve(onlineUsers);
            } catch (e) {
                console.log(e)
                return Promise.reject(e);
            }
        } else {
            return Promise.reject(false);
        }
    }

    async logoutUser(token) {
        if (this.isAuthenticated(token)) {
            try {
                const userInfo  =   this.userInfo(token);
                const session = await getSession
                const results = await session.getSchema('elem').getTable('online_users')
                    .delete()
                    .where('userId = :userId')
                    .bind('userId', userInfo.userId)
                    .execute();

                console.log(results)
                return Promise.resolve(results);
            } catch (e) {
                console.log(e)
                return Promise.reject(e);
            }
        } else {
            return Promise.reject(false);
        }
    }
}


module.exports = UserService;