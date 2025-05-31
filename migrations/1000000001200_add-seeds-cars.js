/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async pgm => {
    const cars = [
        {
            brand:      'Toyota',
            model:      'Camry',
            year:       2021,
            type:       'sedan',
            dailyPrice: 5000,
            status:     1,
        },
        {
            brand:      'BMW',
            model:      'X5',
            year:       2020,
            type:       'suv',
            dailyPrice: 8000,
            status:     2,
        },
        {
            brand:      'Honda',
            model:      'Civic',
            year:       2022,
            type:       'hatchback',
            dailyPrice: 4500,
            status:     1,
        },
    ];
    
    for (const car of cars) {
        const result = await pgm.db.query(
            `SELECT *
             FROM cars
             WHERE brand = $1
               AND model = $2
               AND year = $3`,
            [ car.brand, car.model, car.year ],
        );
        
        if (result.rows.length === 0) {
            await pgm.db.query(
                `INSERT INTO cars (brand, model, year, type, "dayPrice", status)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [ car.brand, car.model, car.year, car.type, car.dailyPrice, car.status ],
            );
        }
    }
};

exports.down = _ => {
};