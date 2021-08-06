import { expect } from 'chai';
import { SinonStub } from 'sinon';
import { MongooseSentryLogger } from '../src';
const mongoose = require('mongoose');
const sinon = require('sinon');

describe('mongoose-sentry-logger Unit Tests', () => {
  it('should throw error if mongoose is undefined', () => {
    expect(() => MongooseSentryLogger.init({ dsn: 'a-test-dsn', mongoose: undefined, service: 'test-service' }))
      .to.throw();
  });

  it('should throw error if dsn is not supplied', () => {
    expect(() => MongooseSentryLogger.init({ dsn: undefined, mongoose, service: 'test-service' }))
      .to.throw();
  });

  it('should throw error if dsn is invalid', () => {
    expect(() => MongooseSentryLogger.init({ dsn: 'a-test-dsn', mongoose, service: 'test-service' }))
      .to.throw();
  });

  it('should succesfully initialize the plugin', () => {
    const stub: SinonStub = sinon.stub(MongooseSentryLogger, 'init');
    stub.returns(() => {});

    expect(() => MongooseSentryLogger.init({ dsn: 'https://xxxxxxxxxxxxx@xxxxx.ingest.sentry.io/1234567', mongoose, service: 'test-service' }))
      .to.not.throw();

    stub.restore();
  });
});
