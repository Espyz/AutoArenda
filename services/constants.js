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

const rentalsStatus = {
    1: 'На рассмотрении',
    2: 'Передано арендатору',
    3: 'Закончено',
    4: 'Отменено',
    5: 'Просрочено',
    
    pending:   1,
    toRentor:  2,
    completed:  3,
    cancelled: 4,
    expired:   5,
};

module.exports = {
    carsStatus:    carsStatus,
    userRole:      userRole,
    rentalsStatus: rentalsStatus,
};