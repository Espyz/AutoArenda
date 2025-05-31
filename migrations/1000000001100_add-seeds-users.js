/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async pgm => {
    const users = [
        {
            login:    'Espyz',
            password: '1234',
            role:     '3',
        },
        {
            login:    'Zypse',
            password: '1234',
            role:     '1',
        },
        {
            login:    'Espyzz',
            password: '1234',
            role:     '2',
        },
    ];
    
    for (const user of users) {
        const result = await pgm.db.query(`SELECT *
                                           FROM users
                                           WHERE "userName" = $1
                                             AND "userPassword" = $2`, [ user.login, user.password ]);
        
        if (result.rows.length === 0) {
            await pgm.db.query(`INSERT INTO users ("userName", "userPassword", role)
                                VALUES ($1, $2, $3)`, [ user.login, user.password, user.role ]);
        }
    }
};

exports.down = _ => {
};
