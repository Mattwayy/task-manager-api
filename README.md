# Task Manager API

REST API для управления задачами с JWT-авторизацией.

![CI/CD](https://github.com/Mattwayy/task-manager-api/actions/workflows/ci.yml/badge.svg)

##  Технологии

- Node.js + Express
- PostgreSQL
- JWT (jsonwebtoken)
- bcrypt (хеширование паролей)
- Zod (валидация)
- Swagger (OpenAPI документация)
- Docker + Docker Compose
- Vitest (тесты)

##  Запуск

### Через Docker (рекомендуется)

```bash
git clone https://github.com/Mattwayy/task-manager-api.git
cd task-manager-api/backend
docker compose up -d

Сервер: http://localhost:3000
Swagger: http://localhost:3000/api-docs


# 1. Поднять БД
cd backend
docker compose up -d postgres

# 2. Установить зависимости
npm install

# 3. Настроить .env (см. .env.example)

# 4. Накатить миграции
npm run migrate

# 5. Запустить
npm run dev

# Важно про миграции
Файл migrations.sql использует DROP TABLE IF EXISTS ... CASCADE — это деструктивная миграция.
Она удаляет все данные при каждом запуске.
