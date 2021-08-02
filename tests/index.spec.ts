import { expect } from 'chai';
import { MongooseSentryLogger } from '../src';

describe('mongoose-sentry-logger unit tests', (): void => {
  it('should initialize plugin successfully', (): void => {

    MongooseSentryLogger.init({ dsn: 'a-test-dsn', mongoose: {} as any, service: 'test-service' });

  });
});
