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

module.exports = {
    getCars: getCars,
};