/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('users', {
        id:           {
            type:       'bigserial',
            primaryKey: true,
        },
        userName:     {
            type: 'varchar(100)',
        },
        userPassword: {
            type: 'varchar(100)',
        },
        role:         {
            type:    'integer',
            default: 1,
            comment: `1 - Клиент,
2 - Менеджер,
3 - Админ`,
        },
    }, {
        ifNotExists: true,
    });
};

exports.down = _ => {
};
