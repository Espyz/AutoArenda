const { pool, winston } = require('../../dependes');
const jwt = require('jsonwebtoken');

async function auth(object) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'auth';
    const client = await pool.connect();
    
    try {
        const userData = await client.query(`SELECT id   AS "userId"
                                                  , role AS "userRole"
                                                  , "userName"
                                             FROM users
                                             WHERE "userName" = $1
                                               AND "userPassword" = $2`, [ object.login, object.password ]);
        
        if (userData.rows.length === 0) {
            data.message = 'Не верный логин или пароль';
            winston.error(`${ funcName }: ${ data.message }`);
            return data;
        }
        
        const token = jwt.sign(userData.rows[0], process.env.PRIVATE_KEY);
        
        if (token) {
            const saveToken = await client.query(`INSERT INTO tokens (token)
                                                  VALUES ($1)
                                                  RETURNING token AS "access", "expireTime"`, [ token ]);
            
            if (saveToken.rows.length > 0) {
                data.message = saveToken.rows[0];
                data.statusCode = 200;
                winston.info(`${ funcName }: Успешно сохранили токен`);
            }
            else {
                data.message = `Не удалось сохранить токен`;
                winston.error(`${ funcName }: ${ data.message }`);
                data.statusCode = 500;
            }
        }
        else {
            data.message = `Не удалось сформировать токен`;
            winston.error(`${ funcName }: ${ data.message }`);
            data.statusCode = 500;
        }
    }
    catch (e) {
        winston.error(`${ funcName }: CATCH ERROR`);
        winston.error(`${ funcName }: ${ e.message }`);
        console.log(e.stack, e.message);
        data.message = e.message;
        data.statusCode = 500;
    }
    finally {
        client.release();
    }
    
    return data;
}

module.exports = {
    auth: auth,
};