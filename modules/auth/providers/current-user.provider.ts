import { Injectable, ProviderScope } from "@graphql-modules/di";
import { OnRequest, OnConnect } from "@graphql-modules/core";
import { User } from "../../../entity/User";
import { ModuleSessionInfo } from "@graphql-modules/core/dist/module-session-info";
import { Connection } from "typeorm";
import { AuthProvider } from "./auth.provider";

@Injectable({
    scope: ProviderScope.Session
})
export class CurrentUserProvider implements OnRequest, OnConnect {
    currentUser: User;
    constructor(private connection: Connection, private authProvider: AuthProvider) {}
    onRequest({ session }: ModuleSessionInfo) {
        if ('req' in session) {
            this.currentUser = session.req.user;
        }
    }
    async onConnect (connectionParams: { authToken ?: string}) {
        if (connectionParams.authToken) {
          // Create a buffer and tell it the data coming in is base64
          const buf = new Buffer(connectionParams.authToken.split(' ')[1], 'base64');
          // Read it back out as a string
          const [username, password]: string[] = buf.toString().split(':');
          if (username && password) {
            const user = await this.connection.getRepository(User).findOne({where: { username }});
    
            if (user && this.authProvider.validPassword(password, user.password)) {
              // Set context for the WebSocket
                this.currentUser = user;
            } else {
              throw new Error('Wrong credentials!');
            }
          }
        } else {
            throw new Error('Missing auth token!');
        }
      }
}