# AutoArenda API

API для системы аренды автомобилей, позволяющее управлять автомобилями, арендами, отзывами и пользователями. Поддерживает роли пользователей (клиент, менеджер, администратор) с различными уровнями доступа.

## Технологии

- **Язык**: Node.js
- **Фреймворк**: Fastify
- **База данных**: PostgreSQL
- **Логирование**: Winston
- **Аутентификация**: JWT (JSON Web Tokens)
- **Миграции и сиды**: node-pg-migrate

## Требования

- Node.js v22 или выше
- PostgreSQL v10 или выше
- npm v10 или выше
- Настроенные переменные окружения (см. `.env.example`)

## Установка

1. **Клонируйте репозиторий**:
   ```bash
   git clone https://github.com/Espyz/AutoArenda.git
   cd AutoArenda
   ```

2. **Установите зависимости**:
   ```bash
   npm install
   ```

3. **Настройте переменные окружения**:
   Скопируйте `.env.example` в `.env` и заполните значения:
   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/autoarenda
   PRIVATE_KEY=your_jwt_secret_key
   API=/api/v1/
   ```

4. **Выполните миграции базы данных**:
   ```bash
   npm run migrate
   ```
   
5. **Запустите сервер**:
   ```bash
   npm run start
   ```

   Сервер будет доступен по адресу `http://localhost:3000`.

## Использование

API предоставляет CRUD-операции для следующих сущностей:
- **Cars** (автомобили)
- **Rentals** (аренды)
- **Reviews** (отзывы)
- **Users** (пользователи)

### Аутентификация

1. **Получите JWT-токен**:
   ```bash
   curl -X POST http://localhost:3000/api/auth \
   -H "Content-Type: application/json" \
   -d '{"login":"Espyz","password":"1234"}'
   ```
   Ответ:
   ```json
   {
     "message": {
       "access": "your_jwt_token",
       "expireTime": "2025-05-31T09:30:43.022Z"
     },
     "statusCode": 200
   }
   ```

2. Используйте токен в заголовке `access` для защищенных маршрутов.

### Примеры запросов

#### Получить список автомобилей
```bash
curl -X GET "http://localhost:3000/api/v1/cars?page=1&limit=10&type=sedan" \
-H "access: <token>"
```
Ответ:
```json
{
  "message": [
    {
      "id": 1,
      "brand": "Toyota",
      "model": "Camry",
      "year": 2021,
      "type": "sedan",
      "dayPrice": 5000,
      "status": "available"
    },
    ...
  ],
  "statusCode": 200
}
```

#### Создать аренду
```bash
curl -X POST http://localhost:3000/api/v1/rentals \
-H "access: <token>" \
-H "Content-Type: application/json" \
-d '{"userId":1,"carId":1,"startDate":"2025-06-01","endDate":"2025-06-08"}'
```
Ответ:
```json
{
  "message": {
    "id": 1,
    "userId": 1,
    "carId": 1,
    "startDate": "2025-06-01",
    "endDate": "2025-06-08",
    "totalCost": 31500,
    "status": "pending"
  },
  "statusCode": 200
}
```

## Структура API

| Сущность   | Маршрут                    | Метод | Описание                     | Доступ                          |
|------------|----------------------------|-------|------------------------------|---------------------------------|
| Cars       | `/cars`                    | GET   | Получить список автомобилей  | Все роли                        |
| Cars       | `/cars/:id`                | GET   | Получить автомобиль по ID    | Все роли                        |
| Cars       | `/cars`                    | POST  | Создать автомобиль           | Менеджер, Админ                 |
| Cars       | `/cars/:id`                | PUT   | Обновить автомобиль          | Менеджер, Админ                 |
| Cars       | `/cars/:id`                | DELETE| Удалить автомобиль           | Менеджер, Админ                 |
| Rentals    | `/rentals`                 | GET   | Получить список аренд        | Все роли (клиент — только свои) |
| Rentals    | `/rentals/:id`             | GET   | Получить аренду по ID        | Все роли (клиент — только свою) |
| Rentals    | `/rentals`                 | POST  | Создать аренду               | Все роли                        |
| Rentals    | `/rentals/:id`             | PUT   | Обновить аренду              | Менеджер, Админ                 |
| Rentals    | `/rentals/:id`             | DELETE| Удалить аренду               | Менеджер, Админ                 |
| Reviews    | `/reviews`                 | GET   | Получить список отзывов      | Все роли                        |
| Reviews    | `/reviews/:id`             | GET   | Получить отзыв по ID         | Все роли                        |
| Reviews    | `/reviews`                 | POST  | Создать отзыв                | Все роли                        |
| Reviews    | `/reviews/:id`             | PUT   | Обновить отзыв               | Все роли (клиент — только свой) |
| Reviews    | `/reviews/:id`             | DELETE| Удалить отзыв                | Все роли (клиент — только свой) |
| Users      | `/users/login`             | POST  | Вход (получить токен)        | Все роли                        |
| Users      | `/users`                   | GET   | Получить список пользователей| Админ                           |
| Users      | `/users/:id`               | GET   | Получить пользователя по ID  | Админ                           |
| Users      | `/users`                   | POST  | Создать пользователя         | Админ                           |
| Users      | `/users/:id`               | PUT   | Обновить пользователя        | Админ                           |
| Users      | `/users/:id`               | DELETE| Удалить пользователя         | Админ                           |

## Роли пользователей

- **Клиент (role: '1')**: Может просматривать автомобили, создавать аренды, оставлять отзывы, просматривать свои аренды и отзывы.
- **Менеджер (role: '2')**: Может управлять автомобилями, арендами и отзывами.
- **Администратор (role: '3')**: Полный доступ, включая управление пользователями.

## Скидки на аренду

- 10% для аренды на 7–13 дней.
- 20% для аренды на 14 и более дней.

## Миграции и сиды

- Миграции создают таблицы `users`, `cars`, `rentals`, `reviews`.
- Сиды добавляют начальные данные:
  - Пользователи: Espyz (admin), Zypse (client), Espyzz (manager).
  - Автомобили: Toyota Camry, BMW X5, Honda Civic.
  - Аренды и отзывы для тестовых данных.

## Логирование

Логи сохраняются через Winston:
- Информационные сообщения (например, успешное создание записи).
- Ошибки с трассировкой стека.

## Разработка

Для запуска в режиме разработки:
```bash
npm run start
```
