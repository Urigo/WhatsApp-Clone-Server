import 'reflect-metadata';
import { AppModule } from './modules/app.module';

export default AppModule.forRoot({ accountsServer: { getServices: () => ({ password: {} })}} as any).typeDefs;
