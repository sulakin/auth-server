<p align="center">
  <img src="./docs/images/icons__server.png" width="320" alt="Authorization (server)" />
</p>

<p align="right">
  <span>English</span> | <a href="./docs/README_RU.md">Русский</a>
</p>

# Authorization (server)

A boilerplate for the auth server using NestJS, Postgres.

It can be used as starter for a new project: implements API for user sign up/sign in (incl. in with social media) and features like email verification, forgotten password, reset password.

## Implementation Details

- [NestJS](https://github.com/nestjs/nest) framework TypeScript starter
- [PostgreSQL client](https://github.com/brianc/node-postgres) for Node.js
- Logging to files [winston](github.com/winstonjs/winston)
- [Nodemailer](https://github.com/nodemailer/nodemailer/) application to allow sending email.
- [OpenAPI (Swagger)](https://www.openapis.org/) documentation module [for NestJS](https://github.com/nestjs/swagger)

## Screencast

![Authorization screencast](./docs/images/screencast.gif)

## How to use

- Clone this repo

- Run `npm install` to install the packages declared in `package.json`

- Configure environment variables in the config files `.development.env` and `.production.env`.

```bash
# Server listen on port
PORT=5000

# Postgres configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=db
POSTGRES_USER=root
POSTGRES_PASSWORD=password

# Nodemailer configuration
MAILER_HOST=smtp.site.com
MAILER_PORT=25
MAILER_USER=user@site.com
MAILER_PASSWORD=password

# Language order for dictionary
LANGS=en,ru

# JWT secret
JWT_SECRET=VerySecretCode

# Social media keys and redirecting link to the frontend
PROVIDER_REDIRECT_URI=http://localhost:3000/connect
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
VK_CLIENT_ID=
VK_CLIENT_SECRET=
```

- Run this commands to import the dump to the databases, specified in the configs:

```bash
# development
$ npm run initdb:dev

# production mode
$ npm run initdb:prod
```

_Or import the dump by yourself from the file `dump-postgres.sql` in the project root._

- Edit email templates for your project, files are in the folder `email_templates`

- Run the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Build

This command compiles an application into output folder `dist`.

```bash
npm run build
```

## API

Server listen on port `5000` and expose the following APIs:

| API                       | Method | Params                                              | Description                                                    |
| ------------------------- | ------ | --------------------------------------------------- | -------------------------------------------------------------- |
| `/auth/register`          | POST   | **email** _string_<br>**password** _string_         | Registers a new user                                           |
| `/auth/confirm`           | POST   | **token** _string_                                  | Validates token sent in the email and activates user's account |
| `/auth/login`             | POST   | **email** _string_<br>**password** _string_         | Login user                                                     |
| `/auth/forgot`            | POST   | **email** _string_                                  | Sends token by email to reset password                         |
| `/auth/reset`             | POST   | **password** _string_<br>**confirm_token** _string_ | Changes user password                                          |
| `/auth/connect/:provider` | POST   | **code** _string_<br>**provider** _string_          | Login with social media                                        |

## JWT authorization

This project use JSON Web Token (JWT) Bearer Token as authentication. The login API returns a token that you have to use to send a correct authorization header in calls that requires authentication.

Authorization header example:

```
 Authorization → Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..._iywmI
```

## Documentation

Once the application is running you can visit [http://localhost:5000/api/docs/](http://localhost:5000/api/docs/) to see the Swagger interface.

## Logger

All request and response are logged [winston](github.com/winstonjs/winston) so this can help you to debug in production. Files two types: `error` and all the rest `combined`, saved in folder `logs`.

## Client

A client in repo [auth-client](https://github.com/sulakin/auth-client) has been implemented for this API.

<p align="center">
  <a href="https://github.com/sulakin/auth-client" title="Authorization (client)">
    <img src="./docs/images/icons__client.png" width="320" alt="Authorization (client) " />
  </a>
</p>

## License

Copyright © 2021 MIT by [Sulakin Vadim](https://github.com/sulakin)
