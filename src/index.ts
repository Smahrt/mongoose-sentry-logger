import { Mongoose } from 'mongoose';
import * as Sentry from '@sentry/node';

export interface MongooseSentryLoggerInitOptions {
  dsn: string;
  service: string;
  mongoose: Mongoose;
}

export namespace MongooseSentryLogger {
  export const initSentry = ({ dsn, service }: Partial<MongooseSentryLoggerInitOptions>) => {
    Sentry.init({ dsn, tracesSampleRate: 1.0 });
    Sentry.setTag('service', service);
  };

  export const findAndCaptureModelErrors = (db: Mongoose) => {
    Object['values'](db.models).forEach(model => {
      model.events.on('error', err => Sentry.captureException(err, { tags: { model: model.modelName } }));
    });
  };

  export const listenToMongooseConnectionEvents = (db: Mongoose) => {
    db.connection.on('connected', (() => {
      findAndCaptureModelErrors(db);
    }));

    db.connection.on('error', ((err: any) => {
      Sentry.captureException(err);
    }));
  };

  export const init = (opts: MongooseSentryLoggerInitOptions) => {
    if (!opts) {
      throw new Error('Missing required config options');
    }

    const { mongoose, dsn, service } = opts;

    if (!mongoose || !dsn || !service) {
      throw new Error(`Missing one or more required parameters`);
    }

    initSentry({ dsn, service });
    listenToMongooseConnectionEvents(mongoose);

    return mongoose;
  };
}
