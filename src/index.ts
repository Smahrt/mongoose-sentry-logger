import { Mongoose } from 'mongoose';
import * as Sentry from '@sentry/node';
import Logger from 'bunyan';

export interface MongooseSentryLoggerInitOptions {
  dsn: string;
  service?: string;
  debug?: boolean;
  mongoose: Mongoose;
}

export interface MongooseLoggerState {
  type: 'warn' | 'error' | 'info' | 'debug'; // level
  message: string; // log message
  className: string; // className
  pid: number;
  date: Date;
}

export namespace MongooseSentryLogger {
  let DEBUG_MODE: boolean;

  const debug = (...msg: any[]) => {
    if (DEBUG_MODE) {
      console.log('msl:', ...msg);
    }
  }

  export const initSentry = ({ dsn, service }: Partial<MongooseSentryLoggerInitOptions>) => {
    Sentry.init({ dsn, tracesSampleRate: 1.0 });
    Sentry.setTag('service', service || 'mongoose');
    debug('initialized sentry with dsn:', dsn);
  };

  const handleModelError = function (error: any, doc: any, next: any) {
    debug('mongoose error caught at schema-level', error.name);
    Sentry.captureException(error);
    next();
  }

  export const findAndCaptureMongooseErrors = (db: Mongoose) => {
    Object['values'](db.models).forEach(model => {
      model.events.on('error', err => {
        debug('mongoose error:', err.name, 'caught at model:', model.modelName);
        Sentry.captureException(err, { tags: { model: model.modelName } });
      });
    });
  };

  export const initCustomLogger = (db: Mongoose, service: string) => {
    const log = Logger.createLogger({
      name: service,
      streams: [
        {
          stream: process.stdout,
          level: 'info'
        },
        {
          stream: process.stdout,
          level: 'debug'
        },
        {
          stream: process.stderr,
          level: 'error'
        }
      ],
    });

    const mongooseLogger = (msg: string, state: MongooseLoggerState) => {
      debug('at mongoose logger', msg, state);

      switch (state.type) {
        case 'debug':
          log.debug(state);
          break;
        case 'info':
          log.info(state);
          break;
        case 'warn':
          log.warn(state);
        case 'error':
        default:
          log.error(state);
      }
    }

    return mongooseLogger;
  }

  export const listenToMongooseConnectionEvents = (db: Mongoose) => {
    db.plugin(function (schema, options) {
      [
        'save',
        'update',
        'findOneAndUpdate',
        'findOneAndUpdate',
        'insertMany'
      ]
        .forEach(method => schema.post(method, handleModelError));
    });
    debug('initialized global plugin for error-handling middleware');

    db.connection.on('connected', (() => {
      findAndCaptureMongooseErrors(db);
      debug('on:connected:registered mongoose error events');
    }));

    db.connection.on('error', ((err: any) => {
      debug('caught connection error:', err.name);
      Sentry.captureException(err);
    }));
  };

  export const init = (opts: MongooseSentryLoggerInitOptions) => {
    if (!opts) {
      throw new Error('Missing required config options');
    }

    const { mongoose, dsn, service, debug: debugMode = false } = opts;

    if (!mongoose || typeof mongoose !== 'object') {
      throw new Error('Mongoose instance not supplied');
    }

    if (!dsn || typeof dsn !== 'string') {
      throw new Error('Require a valid Sentry DSN for your project');
    }

    DEBUG_MODE = debugMode;

    initSentry({ dsn, service });
    listenToMongooseConnectionEvents(mongoose);
    const logger = initCustomLogger(mongoose, service || 'mongoose-sentry-logger');

    debug('completed plugin initialization!');
    return logger;
  };
}
