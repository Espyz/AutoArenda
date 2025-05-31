/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async pgm => {
    const statuses = [
        'Доступен',
        'Арендован',
    ];
    
    for (const status of statuses) {
        const result = await pgm.db.query(`SELECT *
                                           FROM carsstatus
                                           WHERE value = $1`, [ status ]);
        
        if (result.rows.length === 0) {
            await pgm.db.query(`INSERT INTO carsstatus (value)
                                VALUES ($1)`, [ status ]);
        }
    }
};

exports.down = _ => {
};
