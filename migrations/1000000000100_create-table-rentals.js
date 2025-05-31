/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('rentals', {
        id:        {
            type:       'bigserial',
            primaryKey: true,
        },
        userId:    {
            type:    'bigint',
            comment: 'Id арендовавшего пользователя',
        },
        carId:     {
            type:    'bigint',
            comment: 'Id арендованного автомобиля',
        },
        dateStart: {
            type:    'timestamp with time zone',
            default: pgm.func('now()'),
            comment: 'Дата начала аренды',
        },
        dateEnd:   {
            type:    'timestamp with time zone',
            default: pgm.func('now()'),
            comment: 'Дата окончания аренды',
        },
        fullPrice: {
            type:    'numeric(30, 2)',
            comment: 'Полная стоимость аренды автомобиля',
            default: 0.00,
        },
        status:    {
            type:    'integer',
            default: 1,
            comment: `1 - На рассмотрении,
2 - Передано арендатору,
3 - Закончено,
4 - Отменено,
5 - Просрочено`,
        },
    }, {
        ifNotExists: true,
    });
};

exports.down = _ => {
};
