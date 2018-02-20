import { Connection } from "typeorm";
import { User } from "../entity/User";

export interface AppContext {
  currentUser: User;
  connection: Connection;
}