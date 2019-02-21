import 'reflect-metadata';
import { AppModule } from './modules/app.module';

const accountsServer: any = { getServices: () => ({ password: {} })};
const connection: any = {};

export default AppModule.forRoot({ accountsServer, connection }).typeDefs;
