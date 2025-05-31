/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('reviews', {
        id:         {
            type:       'bigserial',
            primaryKey: true,
        },
        userId:     {
            type:    'bigint',
            comment: 'Id арендовавшего пользователя',
        },
        carId:      {
            type:    'bigint',
            comment: 'Id арендованного автомобиля',
        },
        dateCreate: {
            type:    'timestamp with time zone',
            default: pgm.func('now()'),
            comment: 'Дата начала аренды',
        },
        rating:     {
            type:    'integer',
            default: '5',
            comment: 'Оценка автомобиля по 10-бальной шкале',
        },
        comment:    {
            type:    'varchar(500)',
            comment: 'Отзыв на автомобиль',
        },
    }, {
        ifNotExists: true,
    });
};

exports.down = _ => {
};
