const mysqlx = require('@mysql/xdevapi');
const config    =   require('./config');


module.exports.getSession = mysqlx.getSession(config.mysql);