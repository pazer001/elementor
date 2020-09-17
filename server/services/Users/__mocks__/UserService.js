class UserService {
    async createUser (email, password) {
        if(!email || !password) {
            return Promise.resolve(false);
        }
        return Promise.resolve(1);
    }
    async loginUser (email, password) {
        try {
            if(!email || !password) {
                return Promise.reject({
                    message: 'Missing details'
                });
            }

            const session   =   await getSession
            const row = await session.getSchema('elem').getTable('users')
                .select(['email'])
                .execute();
            return Promise.resolve(row);
        } catch (e) {
            console.log(e)
            return Promise.reject(e);
        }
    }
}


module.exports = UserService;