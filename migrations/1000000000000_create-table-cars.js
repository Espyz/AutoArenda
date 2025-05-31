/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('cars', {
        id:       {
            type:       'bigserial',
            primaryKey: true,
        },
        brand:    {
            type:    'varchar(100)',
            comment: 'Марка автомобиля',
        },
        model:    {
            type:    'varchar(100)',
            comment: 'Модель автомобиля',
        },
        year:     {
            type:    'integer',
            comment: 'Год выпуска автомобиля',
        },
        type:     {
            type:    'varchar(100)',
            comment: 'Тип автомобиля',
        },
        dayPrice: {
            type:    'numeric(30,2)',
            comment: 'Стоимость авто за день (без скидки)',
        },
        status:   {
            type:    'integer',
            default:  1,
            comment: '1 - Доступен,\n2 - Арендован',
        },
    }, {
        ifNotExists: true,
    });
};

exports.down = _ => {
};
