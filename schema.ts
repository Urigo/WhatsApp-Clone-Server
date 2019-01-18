import 'reflect-metadata';
import { AppModule } from "./modules/app.module";

// Ask for typeDefs without all schema with business logic
export default AppModule.forRoot({}).typeDefs;
