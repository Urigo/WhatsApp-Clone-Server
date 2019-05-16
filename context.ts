import { ModuleContext } from '@graphql-modules/core';
import { User } from './db';
import { Response } from 'express';
import { PoolClient } from 'pg';

export type MyContext = {
  currentUser: User;
  res: Response;
  db: PoolClient;
} & ModuleContext;
