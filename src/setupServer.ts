import { CustomError, IErrorResponse } from './shared/globals/helpers/error-handler';

import { Application, json, urlencoded, Response, Request, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import compression from 'compression';
import 'express-async-errors';
import { config } from './config';
import { createClient } from 'redis';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import applicationRoutes from './routes';

const SERVER_PORT = 8000;
const start = (app: Application): void => {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  globalErrorHandler(app);
  startServer(app);
};

const securityMiddleware = (app: Application): void => {
  app.use(
    cookieSession({
      name: 'session',
      keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
      maxAge: 24 * 7 * 3600000,
      secure: config.NODE_ENV !== 'development'
    })
  );
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.CLIENT_URL,
      credentials: true, //Using the credentials option in CORS allows you to include credentials such as cookies and authorization headers in cross-origin requests.
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'PATCH']
    })
  );
};

const standardMiddleware = (app: Application): void => {
  app.use(compression());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
};

const routesMiddleware = (app: Application): void => {
  applicationRoutes(app);
};

const globalErrorHandler = (app: Application): void => {
  // Catch all unmatched routes (404 errors)
  app.all('*', (req: Request, res: Response) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
  });

  // Handle custom errors

  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    console.log(error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeErrors());
    }
    next();
  });
};

const startServer = async (app: Application): Promise<void> => {
  try {
    const httpServer: http.Server = new http.Server(app);
    const socketIO: Server = await createSocketIO(httpServer);
    startHttpServer(httpServer);
    socketIOConnections(socketIO);
  } catch (error) {
    console.log(error);
  }
};
const createSocketIO = async (httpServer: http.Server): Promise<Server> => {
  const io: Server = new Server(httpServer, {
    cors: {
      origin: config.CLIENT_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
  });

  const pubClient = createClient({ url: config.REDIS_HOST });
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
  return io;
};

const startHttpServer = (httpServer: http.Server): void => {
  console.log(`Server has started with process ${process.pid}`);
  httpServer.listen(SERVER_PORT, () => {
    console.log(`Server running on port ${SERVER_PORT}`);
  });
};

const socketIOConnections = (io: Server): void => {};

export { start };
