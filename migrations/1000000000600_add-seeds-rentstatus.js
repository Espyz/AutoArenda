/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async pgm => {
    const statuses = [
        'На рассмотрении',
        'Передано арендатору',
        'Закончено',
        'Отменено',
        'Просрочено',
    ];
    
    for (const status of statuses) {
        const result = await pgm.db.query(`SELECT *
                                           FROM rentstatus
                                           WHERE value = $1`, [ status ]);
        
        if (result.rows.length === 0) {
            await pgm.db.query(`INSERT INTO rentstatus (value)
                                VALUES ($1)`, [ status ]);
        }
    }
};

exports.down = _ => {
};
