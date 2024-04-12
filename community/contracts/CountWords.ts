import { Type } from '@sinclair/typebox';
import { FeatureContract } from '../../core';
import { MBaseContext } from '../models/base-context';

export const { CountWords } = FeatureContract.createNamedExport({
  name: 'CountWords',
  input: Type.Object({
    url: Type.String(),
    words: Type.Array(Type.String()),
  }),
  output: Type.Object({
    words: Type.Record(Type.String(), Type.Number()),
  }),
  ctx: Type.Intersect([
    MBaseContext.schema
  ]),
});