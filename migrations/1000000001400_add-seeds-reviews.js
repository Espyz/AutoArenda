/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async pgm => {
    const reviews = [
        {
            carId: 1,
            userId: 1,
            rating: 5,
            comment: 'Great car! Very comfortable and reliable.'
        },
        {
            carId: 2,
            userId: 2,
            rating: 4,
            comment: 'Powerful SUV, but fuel consumption is high.'
        },
        {
            carId: 3,
            userId: 1,
            rating: 3,
            comment: 'Decent car, but the interior could be better.'
        }
    ];
    
    for (const review of reviews) {
        const result = await pgm.db.query(
            `SELECT * FROM reviews WHERE "carId" = $1 AND "userId" = $2 AND rating = $3`,
            [review.carId, review.userId, review.rating]
        );
        
        if (result.rows.length === 0) {
            await pgm.db.query(
                `INSERT INTO reviews ("carId", "userId", rating, comment)
                 VALUES ($1, $2, $3, $4)`,
                [review.carId, review.userId, review.rating, review.comment]
            );
        }
    }
};

exports.down = _ => {
};