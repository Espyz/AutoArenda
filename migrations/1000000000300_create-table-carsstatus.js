/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('carsstatus', {
        id:    {
            type:       'bigserial',
            primaryKey: true,
        },
        value: {
            type: 'varchar(100)',
        },
    }, {
        ifNotExists: true,
    });
};

exports.down = _ => {
};
