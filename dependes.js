require('dotenv');
const Pool = require('pg-pool');
const logger = require('winston');
const jwt = require('jsonwebtoken');
const constants = require('./services/constants');

const winston = logger.createLogger({
    level:      'info',
    format:     logger.format.combine(
        logger.format.timestamp(),
        logger.format.json(),
    ),
    transports: [
        new logger.transports.File({ filename: 'logs/app.log' }),
        new logger.transports.Console(),
    ],
});

//TODO: exp в таблице tokens delete их
const config = {
    user:                    process.env.DB_USER,
    password:                process.env.DB_PASSWORD,
    host:                    process.env.DB_HOST,
    port:                    process.env.DB_PORT,
    database:                process.env.DB_DATABASE,
    ssl:                     false,
    connectionTimeoutMillis: 10000,
    max:                     30,
};

const pool = new Pool(config);

pool.on('error', (error, client) => {
    winston.error(error);
    process.exit(-1);
});

pool.on('connect', client => {
    winston.info('New client');
});

pool.on('remove', client => {
    winston.info('Client pool removed');
});

async function checkTokenAndSetReq(request) {
    let check = false;
    let isExpired = false;
    let decoded;
    if (request && 'headers' in request) {
        if ('access' in request.headers) {
            let token = request.headers.access;
            let client = await pool.connect();
            
            try {
                const checkExpire = await client.query(`SELECT NOW() < "expireTime" AS "check"
                                                        FROM tokens
                                                        WHERE token LIKE $1`, [ `%${ token }%` ]);
                
                if (checkExpire.rows.length > 0) {
                    if (checkExpire.rows[0].check) {
                        decoded = jwt.verify(token, process.env.PRIVATE_KEY);
                        console.log(decoded);
                        request.info = decoded;
                        check = true;
                    }
                    else {
                        winston.error(`Токен просрочен`);
                        check = true;
                        isExpired = true;
                        request.info = {};
                    }
                }
                else {
                    winston.error(`Токен не существует`);
                    check = false;
                    isExpired = false;
                    request.info = {};
                }
            }
            catch (err) {
                winston.error(err);
                
                if (err.name === 'TokenExpiredError') {
                    isExpired = true;
                    check = true;
                    request.info = {};
                }
                else if (err.name === 'JsonWebTokenError') {
                    check = false;
                }
            }
            finally {
                client.release();
            }
        }
    }
    
    return { check, isExpired };
}

module.exports = {
    winston:             winston,
    pool:                pool,
    constants:           constants,
    checkTokenAndSetReq: checkTokenAndSetReq,
};