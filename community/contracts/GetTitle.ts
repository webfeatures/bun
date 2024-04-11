import { Type } from '@sinclair/typebox';
import { FeatureContract } from '../../core';
import { MBaseContext } from '../logic/base-context';

export const { GetTitle } = FeatureContract.createNamedExport({
  name: 'GetTitle',
  input: Type.Object({
    url: Type.String(),
  }),
  output: Type.Object({
    title: Type.String(),
  }),
  ctx: MBaseContext.schema,
});