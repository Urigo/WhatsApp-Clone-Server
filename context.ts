import { ModuleContext } from '@graphql-modules/core';
import { Response } from 'express';

export type MyContext = {
  res: Response;
} & ModuleContext;
