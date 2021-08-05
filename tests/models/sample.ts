import { Document, Mongoose } from 'mongoose';
const mongoose: Mongoose = require('mongoose');

interface ISample extends Document {
  foo: number;
  bar: string;
}

const Schema = mongoose.Schema;

const SampleSchema = new Schema<ISample>({
  foo: { type: Number, unique: true },
  bar: { type: String, required: true },
});

export const Sample = mongoose.model<ISample>('Sample', SampleSchema);
