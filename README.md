# TODO List Приложение

Полнофункциональное веб-приложение для управления задачами с аутентификацией, CRUD-операциями и серверной частью на Node.js.

## Структура проекта

- `TodoListFrontend/` - Фронтенд-часть на React, Vite, TypeScript и Redux Toolkit
- `api/` - Серверная часть, адаптированная для Vercel Serverless Functions
- `.env.example` - Пример переменных окружения

## Деплой на Vercel

### Предварительная настройка

1. Создайте базу данных PostgreSQL на любом хостинг-сервисе (например, Supabase, Railway, ElephantSQL)
2. Создайте таблицы в базе данных:

```sql
CREATE TABLE usersr (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE tasksr (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  ischecked BOOLEAN DEFAULT false,
  userId INTEGER REFERENCES usersr(id)
);
```

### Деплой приложения

1. Зарегистрируйтесь на [Vercel](https://vercel.com/)
2. Свяжите ваш GitHub репозиторий с Vercel
3. Настройте переменные окружения в Vercel:
   - `POSTGRES_URL` - URL вашей базы данных PostgreSQL
   - `JWT_SECRET` - секретный ключ для генерации JWT токенов
   - `FRONTEND_URL` - URL, где будет размещен ваш фронтенд
   - `NODE_ENV` - установите в `production`
4. Запустите деплой
5. После деплоя, откройте фронтенд-приложение и обновите `.env.production` с вашим URL:
   ```
   VITE_API_URL=https://YOUR_VERCEL_DOMAIN/api
   ```
6. Повторно задеплойте проект с обновленной переменной окружения

## Локальная разработка

1. Клонируйте репозиторий
2. Установите зависимости для фронтенда и бэкенда:
   ```
   cd TodoListFrontend
   npm install
   cd ../TodoListBackend
   npm install
   ```
3. Настройте переменные окружения в `.env` файлах
4. Запустите сервер разработки для фронтенда:
   ```
   cd TodoListFrontend
   npm run dev
   ```
5. Запустите сервер бэкенда:
   ```
   cd TodoListBackend
   npm start
   ```

## Функциональность

- Регистрация и аутентификация пользователей
- Создание, чтение, обновление и удаление задач
- Отметка задач как выполненных/невыполненных
- Хранение данных в базе PostgreSQL
- Защита API с использованием JWT токенов в куках

## Переменные окружения

Локальная разработка требует следующих переменных окружения:

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=postgres
DB_PASSWORD=YOUR_PASSWORD
DB_PORT=5432
JWT_SECRET=YOUR_SECRET
```
