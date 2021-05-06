import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';

import * as dict from './users.dictionary.json';
import {
  UserDto,
  UserProviderDto,
  UserConfirmDto,
  UserForgotDto,
  UserResetDto,
} from './users.dto';
import {
  IUser,
  IRegisterResponseData,
  IConfirmResponseData,
  ILoginResponseData,
  IForgotResponseData,
  IResetResponseData,
  IConnectResponseData,
} from './users';

import { PG_CONNECTION } from '../shared/consts';
import { LoggerService } from '../shared/logger/logger.service';
import { IMailer } from '../shared/mail/mail';
import { Provider } from '../shared/Provider';
import {
  createToken,
  createConfirmToken,
  createHashedPassword,
  comparePassword,
  generatePassword,
} from '../shared/utils';

@Injectable()
export class UsersService {
  constructor(
    @Inject(PG_CONNECTION) private db: any,
    private logger: LoggerService,
  ) {
    logger.setContext('USERS');
  }

  private async queryUser(field: string, value: any): Promise<IUser> {
    try {
      const { rows } = await this.db.query(
        `SELECT * FROM users WHERE ${field} = '${value}'`,
      );

      const user: IUser = rows[0];

      return user;
    } catch (error) {
      this.logger.error(
        `[queryUser]:server_error, Data: {"field": ${field}, "value": ${value}}, Error: ${JSON.stringify(
          error,
        )}`,
      );

      throw new HttpException(dict.error.server_error, HttpStatus.BAD_REQUEST);
    }
  }

  async register(data: UserDto): Promise<IRegisterResponseData> {
    const { email, password } = data;
    const user = await this.queryUser('email', email);

    if (user) {
      this.logger.warn(
        `[register]:user_already_exists, Data: ${JSON.stringify(data)}`,
      );

      throw new HttpException(
        dict.register.user_already_exists,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await createHashedPassword(password);
    const confirm_token = await createConfirmToken(email, hashPassword);

    try {
      const { rows } = await this.db.query(
        `WITH _user AS (
        INSERT INTO users (email, password, confirm_token)
          VALUES ('${email}', '${hashPassword}', '${confirm_token}')
          RETURNING id
        )
        INSERT INTO users_has_roles (user_id, role_id)
          SELECT id AS user_id, 1 FROM _user
          ON CONFLICT (user_id, role_id) WHERE user_id DO NOTHING
          RETURNING user_id`,
      );

      const message = dict.register.user_is_registered;
      const token = await createToken(rows[0].user_id, email);
      const mailer: IMailer = {
        email,
        template: 'register',
        subject: dict.mailer.verify_email,
        params: { email, password, confirm_token },
      };

      this.logger.log(`[register]:user_is_registered, email: ${email}`);

      return { message, token, mailer };
    } catch (error) {
      this.logger.error(
        `[register]:server_error, Data: ${JSON.stringify(
          data,
        )}, Error: ${JSON.stringify(error)}`,
      );

      throw new HttpException(dict.error.server_error, HttpStatus.BAD_REQUEST);
    }
  }

  async confirm(data: UserConfirmDto): Promise<IConfirmResponseData> {
    const { token } = data;
    const user = await this.queryUser('confirm_token', token);

    if (user) {
      if (user.is_confirmed) {
        this.logger.warn(
          `[confirm]:email_already_confirmed, Data: ${JSON.stringify(data)}`,
        );

        throw new HttpException(
          dict.confirm.email_already_confirmed,
          HttpStatus.BAD_REQUEST,
        );
      }

      try {
        await this.db.query(
          `UPDATE users SET is_confirmed = true, confirm_token = null WHERE id = ${user.id}`,
        );

        const message = dict.confirm.email_successfully_confirmed;

        this.logger.log(`[confirm]:successfully, email: ${user.email}`);

        return { message };
      } catch (error) {
        this.logger.error(
          `[confirm]:server_error, Data: ${JSON.stringify(
            data,
          )}, Error: ${JSON.stringify(error)}`,
        );

        throw new HttpException(
          dict.error.server_error,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    this.logger.warn(`[confirm]:invalid_token, Data: ${JSON.stringify(data)}`);

    throw new HttpException(dict.confirm.invalid_token, HttpStatus.BAD_REQUEST);
  }

  async login(data: UserDto): Promise<ILoginResponseData> {
    const { email, password } = data;
    const user = await this.queryUser('email', email);

    if (!user) {
      this.logger.warn(`[login]:invalid_user, Data: ${JSON.stringify(data)}`);

      throw new HttpException(
        dict.login.email_not_exist,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
      this.logger.warn(
        `[login]:invalid_isPasswordMatch, Data: ${JSON.stringify(data)}`,
      );

      throw new HttpException(
        dict.login.wrong_password,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { is_blocked, is_confirmed } = user;

    if (is_blocked) {
      this.logger.warn(`[login]:blocked, data: ${JSON.stringify(data)}`);

      throw new HttpException(dict.login.user_blocked, HttpStatus.UNAUTHORIZED);
    }

    if (!is_confirmed) {
      this.logger.warn(
        `[login]:email_not_confirm, Data: ${JSON.stringify(data)}`,
      );

      throw new HttpException(
        dict.login.email_not_confirm,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const message = dict.login.successful_login;
    const token = await createToken(user.id, user.email);

    this.logger.log(`[login]:successful, email: ${user.email}`);

    return { message, token };
  }

  async forgot(data: UserForgotDto): Promise<IForgotResponseData> {
    const { email } = data;

    const { rows } = await this.db.query(
      `SELECT
        *, ROUND(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - updated_at)) AS last_mailer_dispatch
        FROM users
        WHERE email = '${email}'`,
    );
    const user = rows[0];

    if (!user) {
      this.logger.warn(
        `[forgot]:user_not_found, Data: ${JSON.stringify(data)}`,
      );

      throw new HttpException(
        dict.forgot.user_not_found,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.is_blocked) {
      this.logger.warn(`[forgot]:blocked, Data: ${JSON.stringify(data)}`);

      throw new HttpException(dict.forgot.user_blocked, HttpStatus.BAD_REQUEST);
    }

    const lastMailerDispatch = user.last_mailer_dispatch;
    const nextMailerDispatch = 3 * 60 * 60 - lastMailerDispatch;

    if (lastMailerDispatch < nextMailerDispatch) {
      return {
        message: dict.forgot.breaktime,
        breaktime: nextMailerDispatch,
      };
    }

    const confirm_token = await createConfirmToken(user.email, user.password);

    await this.db.query(
      `UPDATE users
        SET is_confirmed = false, confirm_token = '${confirm_token}', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${user.id}`,
    );

    const message = dict.forgot.restore_access_has_been_sent;
    const mailer: IMailer = {
      email,
      subject: dict.mailer.password_recovery,
      template: 'forgot',
      params: {
        email,
        token: confirm_token,
      },
    };

    this.logger.log(
      `[forgot]:link_sent_password_recovery, email: ${user.email}`,
    );

    return { message, mailer };
  }

  async reset(data: UserResetDto): Promise<IResetResponseData> {
    const { confirm_token, password } = data;
    const user = await this.queryUser('confirm_token', confirm_token);

    if (!user) {
      this.logger.warn(
        `[reset]:link_is_invalid, Data: ${JSON.stringify(data)}`,
      );

      throw new HttpException(
        dict.reset.link_is_invalid,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await createHashedPassword(password);

    try {
      await this.db.query(
        `UPDATE users
        SET is_confirmed = TRUE, confirm_token = NULL, password = '${hashPassword}'
        WHERE id = ${user.id}`,
      );
    } catch (error) {
      this.logger.error(
        `[reset]:server_error, Data: ${JSON.stringify(
          data,
        )}, Error: ${JSON.stringify(error)}`,
      );

      throw new HttpException(dict.error.server_error, HttpStatus.BAD_REQUEST);
    }

    const email = user.email;
    const message = dict.reset.password_successfully_changed;
    const token = await createToken(user.id, email);

    this.logger.log(`[reset]:password_changed, email: ${email}`);

    const mailer: IMailer = {
      email,
      subject: dict.mailer.password_changed,
      template: 'reset',
      params: {
        email,
        password,
      },
    };

    return { message, token, mailer };
  }

  async connect(data: UserProviderDto): Promise<IConnectResponseData> {
    const { code, provider } = data;
    const api = new Provider(code, provider);
    const email = await api.receiveEmailFromProvider();

    if (!email) {
      this.logger.warn(
        `[connect]:email_not_specified, Data: ${JSON.stringify(data)}`,
      );

      throw new HttpException(
        dict.connect.email_not_specified,
        HttpStatus.BAD_REQUEST,
      );
    }

    let user = await this.queryUser('email', email);

    if (!user) {
      const password = generatePassword();
      const hashPassword = await createHashedPassword(password);

      try {
        await this.db.query(
          `WITH
          _user AS (
            INSERT INTO users (email, password, is_confirmed)
              VALUES ('${email}', '${hashPassword}', TRUE)
              RETURNING id
            ),
          _role AS (
            INSERT INTO users_has_roles (user_id, role_id)
              SELECT id AS user_id, 1 FROM _user
              ON CONFLICT (user_id, role_id) WHERE user_id DO nothing
              RETURNING user_id
          )
          INSERT INTO users_has_providers (user_id, provider_id)
            SELECT user_id, (SELECT id FROM providers WHERE name = '${provider}') FROM _role
            ON CONFLICT (user_id, provider_id) WHERE user_id DO nothing`,
        );

        user = await this.queryUser('email', email);
      } catch (error) {
        this.logger.error(
          `[connect]:server_error, Data: ${JSON.stringify(
            data,
          )}, Error: ${JSON.stringify(error)}`,
        );

        throw new HttpException(
          dict.error.server_error,
          HttpStatus.BAD_REQUEST,
        );
      }

      const message = dict.connect.user_is_registered;
      const token = await createToken(user.id, user.email);
      const mailer: IMailer = {
        email,
        template: 'register_provider',
        subject: dict.mailer.successful_registration,
        params: { email, password, provider },
      };

      this.logger.log(
        `[connect]:user_is_registered, email: ${user.email}, provider: ${provider}`,
      );

      return { message, token, email, mailer };
    }

    try {
      await this.db.query(
        `INSERT INTO users_has_providers (user_id, provider_id)
        VALUES (${user.id}, (SELECT id FROM providers WHERE name = '${provider}'))
        ON CONFLICT (user_id, provider_id) WHERE (user_id = ${user.id}) DO NOTHING`,
      );

      const message = dict.connect.successful;
      const token = await createToken(user.id, user.email);

      this.logger.log(
        `[connect]:successful, email: ${user.email}, provider: ${provider}`,
      );

      return { message, token, email };
    } catch (error) {
      this.logger.error(
        `[connect]:users_has_providers, Data: ${JSON.stringify(
          data,
        )}, Error: ${JSON.stringify(error)}`,
      );

      throw new HttpException(dict.error.server_error, HttpStatus.BAD_REQUEST);
    }
  }
}
