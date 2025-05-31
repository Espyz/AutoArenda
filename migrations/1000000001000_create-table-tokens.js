/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('tokens', {
        id:         {
            type:       'bigserial',
            primaryKey: true,
        },
        token:      {
            type: 'varchar(500)',
        },
        createTime: {
            type:    'timestamp with time zone',
            default: pgm.func('now()'),
        },
        expireTime: {
            type: 'timestamp with time zone',
            default: pgm.func(`now() + INTERVAL '15 minutes'`)
        }
    }, {
        ifNotExists: true,
    });
};

exports.down = _ => {
};
