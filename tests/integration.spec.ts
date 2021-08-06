import { DbHelper } from "./helpers/db.helper";
import { Sample } from "./models/sample";
const mongoose = require('mongoose');
import { expect } from 'chai';
import { SinonSpy } from 'sinon';
const sinon = require('sinon');
import * as Sentry from '@sentry/node';
import { MongooseSentryLogger } from "../src";

let captureExceptionSpy: SinonSpy, callCount = 1;

const initPlugin = () => MongooseSentryLogger.init({ dsn: 'https://xxxxxxxxxxxxx@xxxxx.ingest.sentry.io/1234567', mongoose, service: 'test-service', debug: true });

const handleAssertError = (resolve: () => void, err: any) => {
  expect(captureExceptionSpy.callCount).to.eq(callCount++);

  // remove test error listeners
  Sample.events.listeners('error')
    .filter(listener => listener.name === 'testErrHandler')
    .forEach(listener => Sample.events.removeListener('error', listener as any));

  return resolve();
}

describe('mongoose-sentry-logger Integration Tests', () => {
  before(done => {
    const logger = initPlugin();
    DbHelper.connect({ logger, loggerLevel: 'info' }).then(() => done());
    captureExceptionSpy = sinon.spy(Sentry, 'captureException');
  });

  after(done => {
    captureExceptionSpy.restore();
    DbHelper.closeDatabase().then(() => done());
  });

  it('should catch mongoose model cast errors', async () => {
    await (new Promise<void>((resolve) => {
      Sample.events.on('error', function testErrHandler(err) { return handleAssertError(resolve, err); });

      new Sample({ foo: 'stuff', bar: 'some-other-stuff' }).save()
        .then(() => { })
        .catch(() => { }); // cast error
    }));
  });

  it('should catch mongoose duplicate key errors', async () => {
    await (new Promise<void>((resolve) => {
      Sample.events.on('error', function testErrHandler(err) { return handleAssertError(resolve, err); });

      new Sample({ foo: 1, bar: 'there' }).save()
        .then(() => (new Sample({ foo: 1, bar: 'holla' }).save()))
        .then(() => { })
        .catch(() => { }); // duplicate key error
    }));
  });
});
