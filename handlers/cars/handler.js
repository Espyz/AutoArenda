const { winston, pool, constants } = require('../../dependes');

async function getCars(object) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'getCars';
    let where = ' WHERE id > 0 ';
    let limit = 10;
    let page = 1;
    
    if (object.limit && limit > 0 && limit < 51) {
        limit = object.limit;
    }
    
    if (object.page && object.page > 0) {
        page = object.page;
    }
    
    const params = [ limit, (page - 1) * limit ];
    let b = params.length;
    
    const client = await pool.connect();
    
    try {
        if (object.type) {
            where += ` AND type = $${ ++b } `;
            params.push(object.type);
        }
        
        if (object.minYear) {
            where += ` AND year >= $${ ++b } `;
            params.push(object.minYear);
        }
        
        if (object.maxYear) {
            where += ` AND year <= $${ ++b } `;
            params.push(object.maxYear);
        }
        
        if (object.status) {
            where += ` AND status = $${ ++b } `;
            params.push(constants.carsStatus[object.status]);
        }
        
        const result = await client.query(`SELECT *
                                           FROM cars ${ where }
                                           LIMIT $1 OFFSET $2`, params);
        
        for (const car of result.rows) {
            car.status = constants.carsStatus[car.status];
        }
        
        data.message = result.rows;
        data.statusCode = 200;
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

async function getCarById(object) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'getCarById';
    const client = await pool.connect();
    
    try {
        const result = await client.query(`SELECT *
                                           FROM cars
                                           WHERE id = $1`, [ object.id ]);
        
        if (result.rows.length === 0) {
            data.message = 'Автомобиль не найден';
            data.statusCode = 404;
            return data;
        }
        
        result.rows[0].status = constants.carsStatus[result.rows[0].status];
        data.message = result.rows[0];
        data.statusCode = 200;
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

async function createCar(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'createCar';
    const client = await pool.connect();
    
    try {
        if (info.userRole !== constants.userRole.manager && info.userRole !== constants.userRole.admin) {
            data.message = 'Access denied';
            data.statusCode = 403;
            return data;
        }
        
        const result = await client.query(`INSERT INTO cars (brand, model, year, type, "dayPrice", status)
                                           VALUES ($1, $2, $3, $4, $5, $6)
                                           RETURNING *`,
            [ object.brand, object.model, object.year, object.type, object.dailyPrice, object.status || constants.carsStatus.available ],
        );
        
        if (result.rows.length === 0) {
            data.message = 'Не удалось добавить автомобиль';
            data.statusCode = 500;
            return data;
        }
        
        result.rows[0].status = constants.carsStatus[result.rows[0].status];
        data.message = result.rows[0];
        data.statusCode = 200;
        winston.info(`${ funcName }: Автомобиль успешно добавлен`);
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

async function updateCar(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'updateCar';
    const updates = [];
    const params = [ object.id ];
    let b = params.length;
    const client = await pool.connect();
    
    try {
        if (info.userRole !== constants.userRole.manager && info.userRole !== constants.userRole.admin) {
            data.message = 'Access denied';
            data.statusCode = 403;
            return data;
        }
        
        const check = await client.query(`SELECT *
                                          FROM cars
                                          WHERE id = $1`, [ object.id ]);
        
        if (check.rows.length === 0) {
            data.message = 'Автомобиль не найден';
            data.statusCode = 404;
            return data;
        }
        
        if (object.brand) {
            updates.push(`brand = $${ ++b }`);
            params.push(object.brand);
        }
        
        if (object.model) {
            updates.push(`model = $${ ++b }`);
            params.push(object.model);
        }
        
        if (object.year) {
            updates.push(`year = $${ ++b }`);
            params.push(object.year);
        }
        
        if (object.type) {
            updates.push(`type = $${ ++b }`);
            params.push(object.type);
        }
        
        if (object.dailyPrice) {
            updates.push(`"dayPrice" = $${ ++b }`);
            params.push(object.dailyPrice);
        }
        
        if (object.status) {
            updates.push(`status = $${ ++b }`);
            params.push(constants.carsStatus[object.status]);
        }
        
        const updateString = updates.length > 0 ? updates.join(', ') : 'id = $1';
        const result = await client.query(`UPDATE cars
                                           SET ${ updateString }
                                           WHERE id = $1
                                           RETURNING *`, params);
        
        if (result.rows.length === 0) {
            data.message = 'Не удалось обновить автомобиль';
            data.statusCode = 500;
            return data;
        }
        
        result.rows[0].status = constants.carsStatus[result.rows[0].status];
        data.message = result.rows[0];
        data.statusCode = 200;
        winston.info(`${ funcName }: Car ${ object.id } updated by user ${ info.id }`);
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

async function deleteCar(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'deleteCar';
    const client = await pool.connect();
    
    try {
        if (info.userRole !== constants.userRole.manager && info.userRole !== constants.userRole.admin) {
            data.message = 'Access denied';
            data.statusCode = 403;
            return data;
        }
        
        const check = await client.query(`SELECT *
                                          FROM cars
                                          WHERE id = $1`, [ object.id ]);
        
        if (check.rows.length === 0) {
            data.message = 'Автомобиль не найден';
            data.statusCode = 404;
            return data;
        }
        
        await client.query(`DELETE
                            FROM cars
                            WHERE id = $1`, [ object.id ]);
        
        data.message = 'Автомобиль успешно удален';
        data.statusCode = 200;
        winston.info(`${ funcName }: Автомобиль ${ object.id } удален пользователем ${ info.userId }`);
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
    getCars:    getCars,
    getCarById: getCarById,
    createCar:  createCar,
    updateCar:  updateCar,
    deleteCar:  deleteCar,
};