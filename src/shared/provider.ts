import { HttpException, HttpStatus } from '@nestjs/common';

import fetch from 'node-fetch';
import * as promise from 'bluebird';

import * as dict from '../users/users.dictionary.json';

fetch.Promise = promise;

export class Provider {
  constructor(private code: string, private provider: string) {}

  async receiveEmailFromProvider(): Promise<string> {
    switch (this.provider) {
      case 'google':
        const id_token: string = await fetch(
          `https://oauth2.googleapis.com/token?client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&redirect_uri=${process.env.PROVIDER_REDIRECT_URI}&code=${this.code}&grant_type=authorization_code`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
          .then((response) => response.json())
          .then(({ id_token }) => id_token)
          .catch((e) => {
            throw new HttpException(
              dict.connect.authorization_failed,
              HttpStatus.UNAUTHORIZED,
            );
          });

        return await fetch(
          `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${id_token}`,
        )
          .then((response) => response.json())
          .then(({ email }) => {
            if (!email) {
              throw new HttpException(
                dict.connect.authorization_failed,
                HttpStatus.UNAUTHORIZED,
              );
            }

            return email;
          })
          .catch((e) => {
            throw new HttpException(
              dict.connect.authorization_failed,
              HttpStatus.UNAUTHORIZED,
            );
          });
      case 'facebook':
        const access_token: string = await fetch(
          `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&redirect_uri=${process.env.PROVIDER_REDIRECT_URI}&code=${this.code}`,
        )
          .then((response) => response.json())
          .then(({ access_token }) => access_token)
          .catch((e) => {
            throw new HttpException(
              dict.connect.authorization_failed,
              HttpStatus.UNAUTHORIZED,
            );
          });

        return await fetch(
          `https://graph.facebook.com/me?access_token=${access_token}&fields=email,name`,
        )
          .then((response) => response.json())
          .then(({ email }) => {
            if (!email) {
              throw new HttpException(
                dict.connect.authorization_failed,
                HttpStatus.UNAUTHORIZED,
              );
            }

            return email;
          })
          .catch((e) => {
            throw new HttpException(
              dict.connect.authorization_failed,
              HttpStatus.UNAUTHORIZED,
            );
          });
      case 'vk':
        return await fetch(
          `https://oauth.vk.com/access_token?client_id=${process.env.VK_CLIENT_ID}&client_secret=${process.env.VK_CLIENT_SECRET}&redirect_uri=${process.env.PROVIDER_REDIRECT_URI}&code=${this.code}`,
        )
          .then((response) => response.json())
          .then(({ email }) => {
            if (!email) {
              throw new HttpException(
                dict.connect.authorization_failed,
                HttpStatus.UNAUTHORIZED,
              );
            }

            return email;
          })
          .catch((e) => {
            throw new HttpException(
              dict.connect.authorization_failed,
              HttpStatus.UNAUTHORIZED,
            );
          });
      default:
        throw new HttpException(
          dict.connect.provider_not_found,
          HttpStatus.UNAUTHORIZED,
        );
    }
  }
}
