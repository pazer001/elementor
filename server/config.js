module.exports = {
    server: {
        port: process.env.PORT
    },
    mysql: {
        password: process.env.PASSWORD,
        user: process.env.USER,
        host: process.env.HOST,
        port: process.env.DB_PORT,
        schema: process.env.SCHEME
    },
    jwtSecret: 'y3FXQ0!vRjyD'
};