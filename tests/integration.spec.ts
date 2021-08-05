import { DbHelper } from "./helpers/db.helper";
import { Sample } from "./models/sample";
const mongoose = require('mongoose');
import { expect } from 'chai';
import { SinonSpy } from 'sinon';
const sinon = require('sinon');
import * as Sentry from '@sentry/node';
import { MongooseSentryLogger } from "../src";

let captureExceptionSpy: SinonSpy;

const initPlugin = () => MongooseSentryLogger.init({ dsn: 'https://xxxxxxxxxxxxx@xxxxx.ingest.sentry.io/1234567', mongoose, service: 'test-service' });

const handleAssertError = (resolve) => {
  expect(captureExceptionSpy.calledOnce).to.eq(true);
  Sample.events.removeAllListeners();
  return resolve();
}

describe('mongoose-sentry-logger Integration Tests', () => {
  before(done => {
    initPlugin();
    DbHelper.connect().then(() => done());
    captureExceptionSpy = sinon.spy(Sentry, 'captureException');
  });

  after(done => {
    captureExceptionSpy.restore();
    DbHelper.closeDatabase().then(() => done());
  });

  it('should catch mongoose model cast errors', async () => {
    await (new Promise<void>((resolve) => {
      Sample.events.on('error', () => handleAssertError(resolve));

      new Sample({ foo: 'stuff', bar: 'some-other-stuff' }).save()
        .then(() => { })
        .catch(() => { }); // cast error
    }));
  });

  it('should catch mongoose duplicate key errors', async () => {
    await (new Promise<void>((resolve) => {
      Sample.events.on('error', () => handleAssertError(resolve));

      new Sample({ foo: 1, bar: 'there' }).save()
        .then(() => (new Sample({ foo: 1, bar: 'holla' }).save()))
        .then(() => { })
        .catch(() => { }); // duplicate key error
    }));
  });
});
