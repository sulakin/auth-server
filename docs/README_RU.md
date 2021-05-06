<p align="center">
  <img src="./images/icons__server.png" width="320" alt="Authorization (server)" />
</p>

<p align="right">
  <a href="../README.md">English</a> | <span>Русский</span>
</p>

# Авторизация (сервер)

Серверная часть авторизации с использованием NestJS, Postgres.

Можно использовать в качестве стартера для нового проекта: реализует API для регистрации/входа пользователя (в том числе через социальные сети) и такие функции, как проверка электронной почты, восстановление пароля, сброс пароля.

## Детали реализации

- Фреймворк [NestJS](https://github.com/nestjs/nest) на TypeScript
- [PostgreSQL клиент](https://github.com/brianc/node-postgres) для Node.js
- Логгирование в файлы [winston](github.com/winstonjs/winston)
- [Nodemailer](https://github.com/nodemailer/nodemailer/) приложение, позволяющее отправлять письма.
- [OpenAPI (Swagger)](https://www.openapis.org/) модуль документации [для NestJS](https://github.com/nestjs/swagger)

## Демо

![Authorization screencast](./images/screencast.gif)

## Как использовать

- Склонируйте этот репозиторий
- Запустите `npm install` для установки пакетов, указанных в `package.json`
- Настройте переменные среды в файлах конфигурации `.development.env` и `.production.env`.

```bash
# Сервер прослушивает порт
PORT=5000

# Конфигурация Postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=db
POSTGRES_USER=root
POSTGRES_PASSWORD=password

# Конфигурация Nodemailer
MAILER_HOST=smtp.site.com
MAILER_PORT=25
MAILER_USER=user@site.com
MAILER_PASSWORD=password

# Порядок языков в словаре
LANGS=en,ru

# Ключ шифрования JWT
JWT_SECRET=VerySecretCode

# Ключи социальных сетей и ссылка для редиректа на интерфейс
PROVIDER_REDIRECT_URI=http://localhost:3000/connect
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
VK_CLIENT_ID=
VK_CLIENT_SECRET=
```

- Выполните эти команды для импорта дампа в базы данных, указанные в конфигах:

```bash
# разработка
$ npm run initdb:dev

# продакшн
$ npm run initdb:prod
```

_Или импортируйте дамп самостоятельно из файла `dump-postgres.sql` в корне проекта._

- Отредактируйте шаблоны писем для вашего проекта, файлы находятся в папке `email_templates`

- Запустите приложение

```bash
# разработка
$ npm run start

# разработка с дебагером
$ npm run start:dev

# продакшн
$ npm run start:prod
```

## Сборка

Команда компилирует приложение в папку `dist`.

```bash
npm run build
```

## API

Сервер прослушивает порт `5000` и предоставляет следующие APIs:

| API                       | Метод | Параметры                                           | Описание                                                                        |
| ------------------------- | ----- | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| `/auth/register`          | POST  | **email** _строка_<br>**password** _строка_         | Регистрирует нового пользователя                                                |
| `/auth/confirm`           | POST  | **token** _строка_                                  | Проверяет токен, отправленный по почте и активирует учетную запись пользователя |
| `/auth/login`             | POST  | **email** _строка_<br>**password** _строка_         | Авторизует пользователя                                                         |
| `/auth/forgot`            | POST  | **email** _строка_                                  | Отправляет токен по почте для сброса пароля                                     |
| `/auth/reset`             | POST  | **password** _строка_<br>**confirm_token** _строка_ | Меняет пароль пользователя                                                      |
| `/auth/connect/:provider` | POST  | **code** _строка_<br>**provider** _строка_          | Авторизует через социальные сети                                                |

## JWT авторизация

Для аутентификации используется Bearer токен JSON Web Token (JWT). API входа в систему возвращает токен, который необходимо использовать для отправки правильного заголовка авторизации в вызовах, требующих аутентификации.

Пример заголовка авторизации:

```
 Authorization → Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..._iywmI
```

## Документация

После запуска приложения вы можете перейти на [http://localhost:5000/api/docs/](http://localhost:5000/api/docs/), чтобы увидеть интерфейс Swagger.

## Логгирование

Все запросы и ответы логгируются [winston](github.com/winstonjs/winston), это может помочь вам отлаживаться в режиме продакшена. Файлы двух типов: `error` и все остальные `combined`, сохраняются в папку `logs`.

## Клиент

Для этого сервера реализован клиент [auth-client](https://github.com/sulakin/auth-client).

<p align="center">
  <a href="https://github.com/sulakin/auth-client" title="Authorization (client)">
    <img src="./images/icons__client.png" width="320" alt="Authorization (client)" />
  </a>
</p>

## Лицензия

Copyright © 2021 MIT by [Sulakin Vadim](https://github.com/sulakin)
