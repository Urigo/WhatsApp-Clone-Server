import { UserDb } from "../db";

export interface AppContext {
  currentUser: UserDb;
}
