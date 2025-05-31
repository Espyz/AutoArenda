const { winston, pool, constants } = require('../../dependes');

async function getRentals(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'getRentals';
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
        if (info.userRole === constants.userRole.client) {
            where += ` AND "userId" = $${ ++b } `;
            params.push(info.userId);
        }
        else if (object.userId) {
            where += ` AND "userId" = $${ ++b } `;
            params.push(object.userId);
        }
        
        if (object.carId) {
            where += ` AND "carId" = $${ ++b } `;
            params.push(object.carId);
        }
        
        if (object.status) {
            where += ` AND status = $${ ++b } `;
            params.push(constants.rentalsStatus[object.status]);
        }
        
        const result = await client.query(`SELECT *
                                           FROM rentals ${ where }
                                           LIMIT $1 OFFSET $2`, params);
        
        for (const rental of result.rows) {
            rental.status = constants.rentalsStatus[rental.status];
        }
        
        data.message = result.rows;
        data.statusCode = 200;
        winston.info(`${ funcName }: Аренды получены для пользователя ${ info.userId }`);
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

async function getRentalById(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'getRentalById';
    const client = await pool.connect();
    
    try {
        const result = await client.query(`SELECT *
                                           FROM rentals
                                           WHERE id = $1`, [ object.id ]);
        
        if (result.rows.length === 0) {
            data.message = 'Аренда не найдена';
            data.statusCode = 404;
            return data;
        }
        
        if (info.userRole === constants.userRole.client && result.rows[0].userId !== info.userId) {
            data.message = 'Доступ запрещен: вы можете просматривать только свои аренды';
            data.statusCode = 403;
            return data;
        }
        
        result.rows[0].status = constants.rentalsStatus[result.rows[0].status];
        data.message = result.rows[0];
        data.statusCode = 200;
        winston.info(`${ funcName }: Аренда ${ object.id } получена для пользователя ${ info.userId }`);
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

async function createRental(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'createRental';
    const client = await pool.connect();
    
    try {
        const carCheck = await client.query(`SELECT *
                                             FROM cars
                                             WHERE id = $1
                                               AND status = $2`, [ object.carId, constants.carsStatus.available ]);
        
        if (carCheck.rows.length === 0) {
            data.message = 'Автомобиль не найден или недоступен';
            data.statusCode = 400;
            return data;
        }
        
        const startDate = new Date(object.startDate);
        const endDate = new Date(object.endDate);
        if (endDate < startDate) {
            data.message = 'Дата окончания должна быть позже даты начала';
            data.statusCode = 400;
            return data;
        }
        
        const days = (endDate - startDate) / (1000 * 60 * 60 * 24);
        // Скидка за длительный арендный срок
        let discount = 0;
        
        if (days >= 14) {
            discount = 0.2;
        }
        else if (days >= 7) {
            discount = 0.1;
        }
        
        const totalCost = carCheck.rows[0].dayPrice * days * (1 - discount);
        const result = await client.query(`INSERT INTO rentals ("userId", "carId", "dateStart", "dateEnd", "fullPrice", status)
                                           VALUES ($1, $2, $3, $4, $5, $6)
                                           RETURNING *`, [ object.userId, object.carId, object.startDate, object.endDate, totalCost, constants.rentalsStatus.pending ]);
        
        if (result.rows.length === 0) {
            data.message = 'Не удалось создать аренду';
            data.statusCode = 500;
            return data;
        }
        
        await client.query(`UPDATE cars
                            SET status = $1
                            WHERE id = $2`, [ constants.carsStatus.rented, object.carId ]);
        
        result.rows[0].status = constants.rentalsStatus[result.rows[0].status];
        data.message = result.rows[0];
        data.statusCode = 200;
        winston.info(`${ funcName }: Аренда успешно создана для пользователя ${ info.userId }`);
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

async function updateRental(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'updateRental';
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
                                          FROM rentals
                                          WHERE id = $1`, [ object.id ]);
        
        if (check.rows.length === 0) {
            data.message = 'Аренда не найдена';
            data.statusCode = 404;
            return data;
        }
        
        if (object.userId) {
            updates.push(`"userId" = $${ ++b }`);
            params.push(object.userId);
        }
        if (object.carId) {
            updates.push(`"carId" = $${ ++b }`);
            params.push(object.carId);
        }
        if (object.startDate) {
            updates.push(`"startDate" = $${ ++b }`);
            params.push(object.startDate);
        }
        if (object.endDate) {
            updates.push(`"endDate" = $${ ++b }`);
            params.push(object.endDate);
        }
        if (object.totalCost) {
            updates.push(`"totalCost" = $${ ++b }`);
            params.push(object.totalCost);
        }
        if (object.status) {
            updates.push(`status = $${ ++b }`);
            params.push(constants.rentalsStatus[object.status]);
        }
        
        const updateString = updates.length > 0 ? updates.join(', ') : 'id = $1';
        
        const result = await client.query(`UPDATE rentals
                                           SET ${ updateString }
                                           WHERE id = $1
                                           RETURNING *`, params);
        
        if (result.rows.length === 0) {
            data.message = 'Не удалось обновить аренду';
            data.statusCode = 500;
            return data;
        }
        
        if (object.status && (object.status === 'completed' || object.status === 'cancelled')) {
            await client.query(`UPDATE cars
                                SET status = $1
                                WHERE id = $2`, [ constants.carsStatus.available, check.rows[0].carId ]);
        }
        
        result.rows[0].status = constants.rentalsStatus[result.rows[0].status];
        data.message = result.rows[0];
        data.statusCode = 200;
        winston.info(`${ funcName }: Аренда ${ object.id } обновлена пользователем ${ info.userId }`);
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

async function deleteRental(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'deleteRental';
    
    const client = await pool.connect();
    
    try {
        if (info.userRole !== constants.userRole.manager && info.userRole !== constants.userRole.admin) {
            data.message = 'Access denied';
            data.statusCode = 403;
            return data;
        }
        
        const check = await client.query(`SELECT *
                                          FROM rentals
                                          WHERE id = $1`, [ object.id ]);
        
        if (check.rows.length === 0) {
            data.message = 'Аренда не найдена';
            data.statusCode = 404;
            return data;
        }
        
        await client.query(`DELETE
                            FROM rentals
                            WHERE id = $1`, [ object.id ]);
        
        await client.query(`UPDATE cars
                            SET status = $1
                            WHERE id = $2`, [ constants.carsStatus.available, check.rows[0].carId ]);
        
        data.message = 'Аренда успешно удалена';
        data.statusCode = 200;
        winston.info(`${ funcName }: Аренда ${ object.id } удалена пользователем ${ info.userId }`);
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
    getRentals:    getRentals,
    getRentalById: getRentalById,
    createRental:  createRental,
    updateRental:  updateRental,
    deleteRental:  deleteRental,
};
