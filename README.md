# Mongoose Sentry Logger

A simple sentry logging interceptor plugin for mongoose. This plugin works by implementing the following:

* Intercepting error events emitted on mongoose Models
* Intercepting connection error events
* Registering a global plugin that implements an error-handling middleware to intercept errors on a schema-level.

All errors are intercepted and sent to Sentry.

## Dependencies

Ensure you have `mongoose` and `@sentry/node` packages installed on your project before your proceed. If you do not, please run the command below:

```bash
npm i mongoose @sentry/node --save
```

## How to use

1. Import `MongooseSentryLogger`:

    ```js
      const mongoose = require('mongoose');
      const {
          MongooseSentryLogger
      } = require('mongoose-sentry-logger');
    ```

    or using ES6 import:

    ```js
      import mongoose from 'mongoose';
      import {
          MongooseSentryLogger
      } from 'mongoose-sentry-logger';
    ```

2. Initialize the plugin before connecting to your MongoDB

```js
  const logger = MongooseSentryLogger.init({
      mongoose, // Required. Mongoose instance
      service: 'my-app', // Optional. a custom tag to filter events in Sentry
      dsn: 'SENTRY_DSN' // Required. Sentry DSN for your project
  });

  // the init method returns an optional custom bunyan logger
  // that you can pass into your mongoose connection 
  const mongooseOptions = {
    ...,
    logger: logger,
    loggerLevel: 'info'
  }

  // your DB connect script here
  mongoose.connect(uri, mongooseOptions);
```

## Debugging

To enable debugging, simply pass `debug: true` into the init options of the plugin.

```js
  MongooseSentryLogger.init({
    ...
    debug: true
  });
```
