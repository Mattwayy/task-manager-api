# Task Manager — Fullstack App

![CI/CD](https://github.com/Mattwayy/task-manager-api/actions/workflows/ci.yml/badge.svg)

Fullstack-приложение для управления задачами с JWT-авторизацией.

##  Стек

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT + bcryptjs
- Zod (валидация)
- Swagger (документация)

**Frontend:**
- React + Vite
- react-router-dom
- openapi-fetch (типизированный клиент)

**DevOps:**
- Docker Compose
- GitHub Actions (CI/CD)



## Запуск

```bash
git clone https://github.com/Mattwayy/task-manager-api.git
cd task-manager-api
docker compose up -d
