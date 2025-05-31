const carsStatus = {
    1: 'Доступен',
    2: 'Арендован',
    
    available: 1,
    rented:    2,
};

const userRole = {
    1: 'Клиент',
    2: 'Менеджер',
    3: 'Админ',
    
    client:  1,
    manager: 2,
    admin:   3,
};

module.exports = {
    carsStatus: carsStatus,
    userRole:   userRole,
};