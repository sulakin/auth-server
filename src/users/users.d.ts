import { IMailer } from '../shared/mail/mail';

export interface IUser {
  id: number;
  email: string;
  password: string;
  confirm_token?: string;
  is_confirmed: boolean;
  is_blocked: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IRegisterResponseData {
  message: string | Array<string>;
  token: string;
  mailer: IMailer;
}

export interface IConfirmResponseData {
  message: string | Array<string>;
}

export interface ILoginResponseData {
  message: string | Array<string>;
  token: string;
}

export interface IForgotResponseData {
  message: string | Array<string>;
  breaktime?: number;
  mailer?: IMailer;
}

export interface IResetResponseData {
  message: string | Array<string>;
  token: string;
  mailer?: IMailer;
}

export interface IConnectResponseData {
  message: string | Array<string>;
  token: string;
  email: string;
  mailer?: IMailer;
}
