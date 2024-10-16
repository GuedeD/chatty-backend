import express, { Express } from 'express';
import { start } from './setupServer';
import databaseConnection from './setupDatabase';
import { config } from './config';

const initilize = (): void => {
  config.validateConfig();
  databaseConnection();
  const app: Express = express();
  start(app);
};

initilize();
