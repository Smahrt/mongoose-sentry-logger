import { MongoMemoryServer } from 'mongodb-memory-server';
import { Mongoose, MongooseOptions } from 'mongoose';
import { UtilHelper } from './util.helper';
const mongoose: Mongoose = require('mongoose');

let mongod: MongoMemoryServer;

export namespace DbHelper {
  const getMongod = async () => {
    if (!mongod) {
      mongod = await MongoMemoryServer.create();
    }
    return mongod;
  };

  /**
   * Connect to the in-memory database.
   */
  export const connect = async (db?: string) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        mongoose.connection.on('connected', () => {
          resolve();
          UtilHelper.log('connected to database on:', uri);
        });

        const uri = (await getMongod()).getUri();

        const mongooseOpts: MongooseOptions = {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true
        };

        await mongoose.connect(`${uri}${db || ''}`, mongooseOpts);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Drop database, close the connection and stop mongod.
   */
  export const closeDatabase = async () => {
    await mongoose.disconnect();
    await (await getMongod()).stop();
    UtilHelper.log('closed database connection!');
    // process.exit();
  }

  /**
   * Remove all the data for all db collections.
   */
  export const clearDatabase = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }

    UtilHelper.log('cleared database!');
  }
}
