import { Connection } from 'typeorm'
import User from './entity/user'

export interface Context {
  connection: Connection
  user: User
}
