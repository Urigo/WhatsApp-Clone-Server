import { Connection } from "typeorm";
import { User } from "../entity/User";

export interface AppContext {
  user: User;
  connection: Connection;
}