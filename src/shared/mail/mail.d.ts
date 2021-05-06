export interface IMailer {
  email: string;
  subject: string | Array<string>;
  template: string;
  params?: any;
}
