import { ModuleContext } from '@graphql-modules/core';
import { Response } from 'express';
import { PoolClient } from 'pg';

export type MyContext = {
  res: Response;
  db: PoolClient;
} & ModuleContext;
