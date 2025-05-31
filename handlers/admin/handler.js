const { winston, pool, constants } = require('../../dependes');

async function getUsers(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'getUsers';
    let limit = 10;
    let page = 1;
    
    if (object.limit && limit > 0 && limit < 51) {
        limit = object.limit;
    }
    
    if (object.page && object.page > 0) {
        page = object.page;
    }
    
    const params = [ limit, (page - 1) * limit ];
    const client = await pool.connect();
    
    try {
        if (info.userRole !== constants.userRole.admin) {
            data.message = 'Доступ запрещен: только администратор может просматривать пользователей';
            data.statusCode = 403;
            return data;
        }
        
        const result = await client.query(`SELECT id         AS "userId"
                                                , role       AS "userRole"
                                                , "userName" AS "userName"
                                           FROM users
                                           LIMIT $1 OFFSET $2`, params);
        
        data.message = result.rows;
        data.statusCode = 200;
        winston.info(`${ funcName }: Пользователи получены администратором ${ info.userId }`);
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

async function getUserById(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'getUserById';
    
    const client = await pool.connect();
    
    try {
        if (info.userRole !== constants.userRole.admin) {
            data.message = 'Доступ запрещен: только администратор может просматривать пользователей';
            data.statusCode = 403;
            return data;
        }
        
        const result = await client.query(`SELECT id             AS "userId"
                                                , role           AS "userRole"
                                                , "userName"     AS "userName"
                                                , "userPassword" AS "userPassword"
                                           FROM users
                                           WHERE id = $1`, [ object.id ]);
        
        if (result.rows.length === 0) {
            data.message = 'Пользователь не найден';
            data.statusCode = 404;
            return data;
        }
        
        data.message = result.rows[0];
        data.statusCode = 200;
        winston.info(`${ funcName }: Пользователь ${ object.id } получен для администратора ${ info.userId }`);
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

async function createUser(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'createUser';
    
    const client = await pool.connect();
    
    try {
        if (info.userRole !== constants.userRole.admin) {
            data.message = 'Доступ запрещен: только администратор может создавать пользователей';
            data.statusCode = 403;
            return data;
        }
        
        const check = await client.query(`SELECT *
                                          FROM users
                                          WHERE "userName" = $1`, [ object.login ]);
        
        if (check.rows.length > 0) {
            data.message = 'Имя пользователя уже существует';
            data.statusCode = 400;
            return data;
        }
        
        const result = await client.query(`INSERT INTO users ("userName", "userPassword", role)
                                           VALUES ($1, $2, $3)
                                           RETURNING id, "userName", role`, [ object.login, object.password, object.role ]);
        
        if (result.rows.length === 0) {
            data.message = 'Не удалось создать пользователя';
            data.statusCode = 500;
            return data;
        }
        
        data.message = result.rows[0];
        data.statusCode = 200;
        winston.info(`${ funcName }: Пользователь создан администратором ${ info.userId }`);
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

async function updateUser(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'updateUser';
    const updates = [];
    const params = [ object.id ];
    let b = params.length;
    
    const client = await pool.connect();
    
    try {
        if (info.userRole !== constants.userRole.admin) {
            data.message = 'Доступ запрещен: только администратор может обновлять пользователей';
            data.statusCode = 403;
            return data;
        }
        
        const check = await client.query(`SELECT *
                                          FROM users
                                          WHERE id = $1`, [ object.id ]);
        
        if (check.rows.length === 0) {
            data.message = 'Пользователь не найден';
            data.statusCode = 404;
            return data;
        }
        
        if (object.login) {
            updates.push(`"userName" = $${ ++b }`);
            params.push(object.login);
        }
        
        if (object.password) {
            updates.push(`"userPassword" = $${ ++b }`);
            params.push(object.password);
        }
        
        if (object.role) {
            updates.push(`role = $${ ++b }`);
            params.push(object.role);
        }
        
        const updateString = updates.length > 0 ? updates.join(', ') : 'id = $1';
        
        const result = await client.query(`UPDATE users
                                           SET ${ updateString }
                                           WHERE id = $1
                                           RETURNING id, "userName", role`, params);
        
        if (result.rows.length === 0) {
            data.message = 'Не удалось обновить пользователя';
            data.statusCode = 500;
            return data;
        }
        
        data.message = result.rows[0];
        data.statusCode = 200;
        winston.info(`${ funcName }: Пользователь ${ object.id } обновлен администратором ${ info.userId }`);
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

async function deleteUser(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'deleteUser';
    
    const client = await pool.connect();
    
    try {
        if (info.userRole !== constants.userRole.admin) {
            data.message = 'Доступ запрещен: только администратор может удалять пользователей';
            data.statusCode = 403;
            return data;
        }
        
        const check = await client.query(`SELECT *
                                          FROM users
                                          WHERE id = $1`, [ object.id ]);
        
        if (check.rows.length === 0) {
            data.message = 'Пользователь не найден';
            data.statusCode = 404;
            return data;
        }
        
        await client.query(`DELETE
                            FROM users
                            WHERE id = $1`, [ object.id ]);
        
        data.message = 'Пользователь успешно удален';
        data.statusCode = 200;
        winston.info(`${ funcName }: Пользователь ${ object.id } удален администратором ${ info.userId }`);
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
    getUsers:    getUsers,
    getUserById: getUserById,
    createUser:  createUser,
    updateUser:  updateUser,
    deleteUser:  deleteUser,
};