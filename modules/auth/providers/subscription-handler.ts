import { Injectable } from '@graphql-modules/di';
import { User } from "../../../entity/User";
import { validPassword } from "./auth.provider";
import { Connection } from "typeorm";
import { OnConnect } from '@graphql-modules/core';

@Injectable()
export class SubscriptionHandler implements OnConnect {
  async onConnect (connectionParams: any, webSocket: any) {
    if (connectionParams.authToken) {
      // Create a buffer and tell it the data coming in is base64
      const buf = new Buffer(connectionParams.authToken.split(' ')[1], 'base64');
      // Read it back out as a string
      const [username, password]: string[] = buf.toString().split(':');
      if (username && password) {
        const user = await this.connection.getRepository(User).findOne({where: { username }});

        if (user && validPassword(password, user.password)) {
          // Set context for the WebSocket
          return {user};
        } else {
          throw new Error('Wrong credentials!');
        }
      }
    }
    throw new Error('Missing auth token!');
  }

  constructor(private connection: Connection) {}
}
