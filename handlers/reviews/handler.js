const { winston, pool, constants } = require('../../dependes');

async function getReviews(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'getReviews';
    let limit = 10;
    let page = 1;
    
    if (object.limit && limit > 0 && limit < 51) {
        limit = object.limit;
    }
    
    if (object.page && object.page > 0) {
        page = object.page;
    }
    
    const params = [ limit, (page - 1) * limit, object.carId ];
    const client = await pool.connect();
    
    try {
        const result = await client.query(`SELECT *
                                           FROM reviews
                                           WHERE "carId" = $3
                                           LIMIT $1 OFFSET $2`, params);
        
        data.message = result.rows;
        data.statusCode = 200;
        winston.info(`${ funcName }: Отзывы получены для пользователя ${ info.userId }`);
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

async function getReviewById(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'getReviewById';
    
    const client = await pool.connect();
    
    try {
        const result = await client.query(`SELECT *
                                           FROM reviews
                                           WHERE id = $1`, [ object.id ]);
        
        if (result.rows.length === 0) {
            data.message = 'Отзыв не найден';
            data.statusCode = 404;
            return data;
        }
        
        data.message = result.rows[0];
        data.statusCode = 200;
        winston.info(`${ funcName }: Отзыв ${ object.id } получен для пользователя ${ info.userId }`);
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

async function createReview(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'createReview';
    const client = await pool.connect();
    
    try {
        if (object.rating < 1 || object.rating > 10) {
            data.message = 'Оценка должна быть от 1 до 10';
            data.statusCode = 400;
            return data;
        }
        
        const carCheck = await client.query(`SELECT *
                                             FROM cars
                                             WHERE id = $1`, [ object.carId ]);
        
        if (carCheck.rows.length === 0) {
            data.message = 'Автомобиль не найден';
            data.statusCode = 404;
            return data;
        }
        
        const result = await client.query(`INSERT INTO reviews ("carId", "userId", rating, comment)
                                           VALUES ($1, $2, $3, $4)
                                           RETURNING *`, [ object.carId, info.userId, object.rating, object.comment ]);
        
        if (result.rows.length === 0) {
            data.message = 'Не удалось создать отзыв';
            data.statusCode = 500;
            return data;
        }
        
        data.message = result.rows[0];
        data.statusCode = 200;
        winston.info(`${ funcName }: Отзыв успешно создан для пользователя ${ info.userId }`);
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

async function updateReview(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'updateReview';
    const client = await pool.connect();
    
    try {
        const check = await client.query(`SELECT *
                                          FROM reviews
                                          WHERE id = $1`, [ object.id ]);
        
        if (check.rows.length === 0) {
            data.message = 'Отзыв не найден';
            data.statusCode = 404;
            return data;
        }
        
        if (info.userRole === constants.userRole.client && check.rows[0].userId !== info.userId) {
            data.message = 'Доступ запрещен: вы можете обновлять только свои отзывы';
            data.statusCode = 403;
            return data;
        }
        
        const result = await client.query(`UPDATE reviews
                                           SET comment = $2
                                             , rating  = $3
                                           WHERE id = $1
                                           RETURNING *`, [ object.id, object.comment, object.rating ]);
        
        if (result.rows.length === 0) {
            data.message = 'Не удалось обновить отзыв';
            data.statusCode = 500;
            return data;
        }
        
        data.message = result.rows[0];
        data.statusCode = 200;
        winston.info(`${ funcName }: Отзыв ${ object.id } обновлен пользователем ${ info.userId }`);
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

async function deleteReview(object, info) {
    const data = {
        message:    'error',
        statusCode: 400,
    };
    const funcName = 'deleteReview';
    
    const client = await pool.connect();
    
    try {
        const check = await client.query(`SELECT *
                                          FROM reviews
                                          WHERE id = $1`, [ object.id ]);
        
        if (check.rows.length === 0) {
            data.message = 'Отзыв не найден';
            data.statusCode = 404;
            return data;
        }
        
        if (info.userRole === constants.userRole.client && check.rows[0].userId !== info.userId) {
            data.message = 'Доступ запрещен: вы можете удалять только свои отзывы';
            data.statusCode = 403;
            return data;
        }
        
        await client.query(`DELETE
                            FROM reviews
                            WHERE id = $1`, [ object.id ]);
        
        data.message = 'Отзыв успешно удален';
        data.statusCode = 200;
        winston.info(`${ funcName }: Отзыв ${ object.id } удален пользователем ${ info.userId }`);
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
    getReviews:    getReviews,
    getReviewById: getReviewById,
    createReview:  createReview,
    updateReview:  updateReview,
    deleteReview:  deleteReview,
};
