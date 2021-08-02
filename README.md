# Mongoose Sentry Logger

A simple sentry logging interceptor plugin for mongoose

## How to use

1. Import `MongooseSentryLogger`:

    ```js
      const mongoose = require('mongoose');
      const {
          MongooseSentryLogger
      } = require('');
    ```

    or using ES6 import:

    ```js
      import mongoose from 'mongoose';
      import {
          MongooseSentryLogger
      } from '';
    ```

2. Initialize the plugin before connecting to your MongoDB

```js
  MongooseSentryLogger.init({
      mongoose, // Required. Mongoose instance
      service: 'my-app', // Optional. a custom tag to filter events in Sentry
      dsn: 'SENTRY_DSN' // Required. Sentry DSN for your project
  });

  // your DB connect script here
  mongoose.connect(...);
```
