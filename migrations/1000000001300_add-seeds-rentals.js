/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async pgm => {
    const rentals = [
        {
            userId:    1,
            carId:     1,
            startDate: '2025-06-01',
            endDate:   '2025-06-08',
            totalCost: 31500,
            status:    3,
        },
        {
            userId:    2,
            carId:     2,
            startDate: '2025-07-01',
            endDate:   '2025-07-10',
            totalCost: 64800,
            status:    1,
        },
        {
            userId:    1,
            carId:     3,
            startDate: '2025-08-01',
            endDate:   '2025-08-05',
            totalCost: 22500,
            status:    3,
        },
    ];
    
    for (const rental of rentals) {
        const result = await pgm.db.query(
            `SELECT *
             FROM rentals
             WHERE "userId" = $1
               AND "carId" = $2
               AND "dateStart" = $3`,
            [ rental.userId, rental.carId, rental.startDate ],
        );
        
        if (result.rows.length === 0) {
            await pgm.db.query(
                `INSERT INTO rentals ("userId", "carId", "dateStart", "dateEnd", "fullPrice", status)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [ rental.userId, rental.carId, rental.startDate, rental.endDate, rental.totalCost, rental.status ],
            );
        }
    }
};

exports.down = _ => {
};
