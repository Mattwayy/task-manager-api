# Task Manager — Fullstack App

[![CI/CD](https://github.com/Mattwayy/task-manager-api/actions/workflows/ci.yml/badge.svg)](https://github.com/Mattwayy/task-manager-api/actions/workflows/ci.yml)

Fullstack-приложение для управления задачами: REST API на Node.js/Express с JWT-авторизацией, PostgreSQL и React-клиент с типизированным API-клиентом, сгенерированным из OpenAPI-спецификации.

## Содержание

- [Возможности](#возможности)
- [Стек](#стек)
- [Быстрый старт (Docker)](#быстрый-старт-docker)
- [Запуск без Docker](#запуск-без-docker)
- [Переменные окружения](#переменные-окружения)
- [API](#api)
- [Тесты](#тесты)
- [Команды](#команды)
- [Структура проекта](#структура-проекта)
- [База данных](#база-данных)
- [CI/CD](#cicd)
- [Технические решения](#технические-решения)
- [Ограничения и планы](#ограничения-и-планы)

## Возможности

- Регистрация и вход по email и паролю, JWT на 7 дней
- CRUD задач со статусами `pending`, `in_progress`, `completed`
- Изоляция данных: пользователь видит и меняет только свои задачи (чужая задача отвечает `404`)
- Валидация запросов на сервере (Zod) с понятными сообщениями об ошибках
- Документация API: Swagger UI и спецификация OpenAPI 3.0.3
- Интеграционные тесты с реальной PostgreSQL, CI в GitHub Actions
- Запуск всего проекта одной командой через Docker Compose

## Стек

| Слой | Технологии |
| --- | --- |
| Backend | Node.js 20, TypeScript, Express 4, PostgreSQL 16 (`pg`), JWT (`jsonwebtoken`), `bcryptjs`, Zod |
| Frontend | React 19, Vite, react-router-dom, `openapi-fetch` + `openapi-typescript` |
| Тесты | Vitest, Supertest |
| DevOps | Docker, Docker Compose, GitHub Actions |

## Быстрый старт (Docker)

Нужны Docker и Docker Compose.

```bash
git clone https://github.com/Mattwayy/task-manager-api.git
cd task-manager-api

# секрет для JWT берётся из .env (поменяй значение на свою случайную строку)
cp .env.example .env

docker compose up -d
```

Без файла `.env` Compose остановится с понятной ошибкой про `JWT_SECRET`.

| Сервис | Адрес |
| --- | --- |
| Фронтенд | http://localhost:5173 |
| API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api-docs |
| PostgreSQL | localhost:5432 (пользователь и пароль `postgres`, база `tasks_db`) |

При первом запуске фронтенд-контейнер устанавливает зависимости. Дождись адреса Vite в логах: `docker compose logs -f frontend`. Миграции бэкенд применяет сам при каждом старте, они идемпотентны и данные не удаляют.

Остановить: `docker compose down`. Вместе с данными БД: `docker compose down -v`.

## Запуск без Docker

Нужны Node.js 20+ и PostgreSQL 16.

**Backend**

```bash
createdb tasks_db          # или через psql / pgAdmin
cd backend
# создай backend/.env (пример ниже)
npm install
npm run migrate            # создаёт таблицы (повторный запуск безопасен)
npm run dev                # http://localhost:3000, перезапуск при изменениях
```

Пример `backend/.env` (вне Docker `DB_HOST` должен быть `localhost`):

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=tasks_db
JWT_SECRET=любая_длинная_случайная_строка
```

**Frontend**

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

## Переменные окружения

| Переменная | Где | По умолчанию | Описание |
| --- | --- | --- | --- |
| `JWT_SECRET` | backend | нет, **обязательна** | Секрет подписи JWT. Без неё сервер не запустится |
| `PORT` | backend | `3000` | Порт API |
| `DB_HOST` | backend | `postgres` | Хост БД (`localhost` вне Docker) |
| `DB_PORT` | backend | `5432` | Порт БД |
| `DB_USER` | backend | `postgres` | Пользователь БД |
| `DB_PASSWORD` | backend | `postgres` | Пароль БД |
| `DB_NAME` | backend | `tasks_db` | Имя базы |
| `VITE_API_URL` | frontend | `http://localhost:3000` | Адрес API для клиента |

CORS на бэкенде разрешает запросы с `http://localhost:5173` и `http://localhost:3000`.

## API

Полное описание контракта: [`openapi.json`](./openapi.json) (OpenAPI 3.0.3, можно открыть в [Swagger Editor](https://editor.swagger.io)). Интерактивная документация доступна на `/api-docs`.

| Метод | Путь | Доступ | Описание |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | публичный | Регистрация |
| `POST` | `/api/auth/login` | публичный | Вход, возвращает JWT |
| `GET` | `/profile` | JWT | Содержимое токена (для проверки) |
| `GET` | `/api/tasks` | JWT | Список своих задач, новые первыми |
| `POST` | `/api/tasks` | JWT | Создать задачу |
| `GET` | `/api/tasks/:id` | JWT | Получить задачу |
| `PUT` | `/api/tasks/:id` | JWT | Частично обновить задачу |
| `DELETE` | `/api/tasks/:id` | JWT | Удалить задачу |
| `GET` | `/` | публичный | Проверка, что сервис жив |

Токен передаётся в заголовке `Authorization: Bearer <token>`.

Пример:

```bash
# регистрация и вход
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123"}'

TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"secret123"}' | jq -r .token)

# создать задачу и получить список
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"Написать README"}'

curl http://localhost:3000/api/tasks -H "Authorization: Bearer $TOKEN"
```

Ошибки приходят в одном из двух форматов:

```json
{ "error": "Task not found" }
```

```json
{ "errors": [{ "field": "email", "message": "Invalid email format" }] }
```

Второй формат используется для ошибок валидации (`400`).

## Тесты

Интеграционные тесты работают с настоящей PostgreSQL и всегда используют отдельную базу `tasks_test` (имя зашито в `backend/tests/setup.js`), поэтому данные в `tasks_db` не затрагиваются. Перед первым запуском нужно создать эту базу и применить миграции.

```bash
# если БД поднята через docker compose, tasks_test уже создана при первой инициализации тома;
# иначе создай её: createdb tasks_test
cd backend
DB_HOST=localhost DB_NAME=tasks_test npm run migrate    # PowerShell: $env:DB_NAME='tasks_test'; npm run migrate
DB_HOST=localhost npm test -- --run
```

Проверка стиля: `npm run lint` (в `backend` и в `frontend`).

## Команды

**backend** (`cd backend`)

| Команда | Что делает |
| --- | --- |
| `npm run dev` | Запуск с автоперезагрузкой (`tsx watch`) |
| `npm run build` | Компиляция TypeScript в `dist/` |
| `npm start` | Запуск собранной версии (как в продакшене) |
| `npm run migrate` | Создать таблицы и индексы, если их ещё нет |
| `npm run reset` | **Удалить** все таблицы. После этого запусти `npm run migrate` |
| `npm test` | Тесты (в интерактивном терминале `vitest` работает в режиме наблюдения, добавь `-- --run` для одного прогона) |
| `npm run lint` | ESLint |

**frontend** (`cd frontend`)

| Команда | Что делает |
| --- | --- |
| `npm run dev` | Dev-сервер Vite |
| `npm run build` | Сборка в `dist/` |
| `npm run lint` | ESLint |

Типы API-клиента генерируются из спецификации. После изменения контракта обнови `openapi.json` и выполни в `frontend`:

```bash
npx openapi-typescript ../openapi.json -o src/api.types.ts
```

## Структура проекта

```text
.
├── backend/
│   ├── src/
│   │   ├── server.ts          # точка входа: dotenv, app.listen
│   │   ├── app.ts             # Express-приложение (без listen, удобно для тестов)
│   │   ├── config.ts          # обязательные переменные окружения
│   │   ├── db.ts              # пул соединений PostgreSQL
│   │   ├── db/                # migrate.ts, reset.ts и SQL-файлы
│   │   ├── routes/            # маршруты и Swagger-аннотации
│   │   ├── controllers/       # бизнес-логика
│   │   ├── middleware/        # auth (JWT), validate (Zod)
│   │   ├── schemas/           # Zod-схемы запросов
│   │   └── swagger.ts         # конфигурация Swagger UI
│   ├── tests/                 # интеграционные тесты и валидация схем
│   └── docker/init-db.sh      # создаёт базу tasks_test при инициализации Postgres
├── frontend/
│   └── src/
│       ├── api/               # клиент (openapi-fetch) и функции auth/tasks
│       ├── pages/             # Login, Register, Tasks
│       └── api.types.ts       # типы, сгенерированные из openapi.json
├── .github/workflows/ci.yml   # CI/CD
├── docker-compose.yml
├── openapi.json               # спецификация API
└── .env.example
```

## База данных

- `users`: `id`, `username` (уникальный), `email` (уникальный), `password_hash`, `created_at`
- `tasks`: `id`, `title`, `description`, `status` (`pending` | `in_progress` | `completed`), `user_id` → `users.id` (`ON DELETE CASCADE`), `created_at`, `updated_at`

Схема описана в `backend/src/db/migrations.sql`, на `tasks.user_id` и `tasks.status` есть индексы.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) запускается на каждый push и pull request в `main`:

1. **Test Backend:** PostgreSQL как сервис, миграции, линт и тесты.
2. **Test Frontend:** установка зависимостей, сборка и линт.
3. **Build, Smoke Test and Push** (только push в `main`, после успеха двух предыдущих джоб):
   - сборка production-образа бэкенда локально;
   - smoke-тест: образ запускается вместе с временным PostgreSQL в общей Docker-сети, `GET /` должен ответить успехом, иначе джоба падает и в логах выводится вывод контейнера;
   - публикация в Docker Hub (`latest` и тег с SHA коммита) только после успешного smoke-теста. Нужны секреты `DOCKER_USERNAME` и `DOCKER_TOKEN`.

<details>
<summary>Полный файл <code>.github/workflows/ci.yml</code></summary>

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    name: 🧪 Test Backend
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: tasks_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: 📦 Install backend dependencies
        run: npm ci
        working-directory: backend

      - name: 🐘 Create databases and tables
        run: |
          PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE tasks_test;" || true
          PGPASSWORD=postgres psql -h localhost -U postgres -d tasks_db -f src/db/migrations.sql
          PGPASSWORD=postgres psql -h localhost -U postgres -d tasks_test -f src/db/migrations.sql
        working-directory: backend

      - name: 🔍 Run linter
        run: npm run lint
        working-directory: backend

      - name: 🧪 Run tests
        run: npm test -- --run
        working-directory: backend
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USER: postgres
          DB_PASSWORD: postgres
          DB_NAME: tasks_test
          JWT_SECRET: test_secret_key

  test-frontend:
    name: 🎨 Test Frontend
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: 📦 Install frontend dependencies
        run: npm ci
        working-directory: frontend

      - name: 🏗️ Build frontend
        run: npm run build
        working-directory: frontend

      - name: 🔍 Run frontend linter
        run: npm run lint
        working-directory: frontend

  docker:
    name: 🐳 Build, Smoke Test and Push
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🐳 Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: 🔑 Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_TOKEN }}

      # Сначала собираем образ локально, чтобы проверить его до публикации
      - name: 🏗️ Build image (local)
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          load: true
          tags: task-manager-api:test
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: 🚀 Smoke test
        run: |
          set -e
          docker network create test-net
          docker run -d --name test-db --network test-net \
            -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tasks_db \
            postgres:16-alpine

          for i in $(seq 1 15); do
            docker exec test-db pg_isready -U postgres -d tasks_db && break
            sleep 2
          done

          docker run -d --name test-api --network test-net -p 3000:3000 \
            -e DB_HOST=test-db -e DB_USER=postgres -e DB_PASSWORD=postgres -e DB_NAME=tasks_db \
            -e JWT_SECRET=test_secret -e NODE_ENV=production \
            task-manager-api:test

          ok=0
          for i in $(seq 1 15); do
            if curl -fs http://localhost:3000/ > /dev/null; then ok=1; break; fi
            sleep 2
          done

          if [ "$ok" != "1" ]; then
            echo "❌ Smoke test failed"
            docker logs test-api
            exit 1
          fi
          echo "✅ Smoke test passed"

      - name: 🧹 Cleanup
        if: always()
        run: |
          docker rm -f test-api test-db || true
          docker network rm test-net || true

      # Публикуем только после успешного smoke-теста (слои берутся из кэша)
      - name: 📤 Push to Docker Hub
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/task-manager-api:latest
            ${{ secrets.DOCKER_USERNAME }}/task-manager-api:${{ github.sha }}
          cache-from: type=gha
```

</details>

## Технические решения

- Пароли хешируются `bcryptjs`, JWT живёт 7 дней, секрет обязателен и не имеет значения по умолчанию.
- Все SQL-запросы параметризованы. Доступ к задачам всегда фильтруется по `user_id` из токена.
- `app.ts` не запускает сервер, поэтому тесты работают с приложением напрямую через Supertest.
- API-клиент фронтенда типизирован по `openapi.json`: изменение контракта сразу видно на уровне типов.
- Образ бэкенда собирается multi-stage (dev / builder / prod), в продакшен-образ попадают только `dist/` и production-зависимости.

## Ограничения и планы

- Токен хранится в `localStorage`. Для продакшена лучше httpOnly-cookie и refresh-токены.
- Нет пагинации и фильтров в списке задач, а также ограничения частоты запросов на `/api/auth`.
- Smoke-тест проверяет, что контейнер стартует и отвечает, но не обращается к БД. Планируется эндпоинт `/health` с запросом `SELECT 1`.
- Docker Compose настроен для разработки (bind-mount, открытый порт PostgreSQL), для продакшена нужна отдельная конфигурация.

## Автор

[Mattwayy](https://github.com/Mattwayy)