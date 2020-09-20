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
                .insert(['email', 'password', 'role'])
                .values([email, password, 'Admin'])
                .execute();
            return Promise.resolve(row.getAffectedItemsCount());
        } catch (e) {
            console.log(e)
            return Promise.reject(e);
        }
    }

    async loginUser(email, password, userAgent, ip) {
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

            await session.getSchema('elem').getTable('online_users')
                .insert(['userId', 'ip_address', 'user_agent'])
                .values(payload.id, ip, userAgent)
                .execute();
            
            await session.executeSql('SET @email = ?;', email).execute()

            await session.sql(`UPDATE users SET users.login_count = login_count + 1 WHERE email = @email`)
                .execute();

            const token = jwt.sign(payload, config.jwtSecret);
            return Promise.resolve({token});
        } catch (e) {
            console.log(e)
            return Promise.reject(e);
        }
    }

    userInfo(user) {
        return user;
    }

    async onlineUsers() {
        try {
            const session = await getSession
            const results = await session.sql(`SELECT users.email, users.role, online_users.timestamp, online_users.ip_address, users.timestamp AS registeredTimestamp, online_users.user_agent, users.login_count FROM elem.online_users 
                                                        JOIN elem.users ON online_users.userId = users.id
                                                        WHERE online_users.timestamp >= NOW() - INTERVAL 20 MINUTE;`)
                .execute();

            const onlineUsers = results.fetchAll().map(user => ({email: user[0], role: user[1], timestamp: user[2], ipAddress: user[3], registeredTimestamp: user[4], userAgent: user[5], loginCount: user[6]}));

            return Promise.resolve(onlineUsers);
        } catch (e) {
            console.log(e)
            return Promise.reject(e);
        }
    }

    async logoutUser(user) {
        try {
            const session = await getSession
            await session.getSchema('elem').getTable('online_users')
                .delete()
                .where('userId = :userId')
                .bind('userId', user.id)
                .execute();

            return Promise.resolve(true);
        } catch (e) {
            console.log(e)
            return Promise.reject(e);
        }
    }
}


module.exports = UserService;