import { Type } from '@sinclair/typebox';
import { FeatureContract } from '../../core';
import { MBaseContext } from '../logic/base-context';

export const { SearchWebPages } = FeatureContract.createNamedExport({
  name: 'SearchWebPages',
  input: Type.Object({
    url: Type.String(),
  }),
  output: Type.Object({
    web_pages: Type.Array(Type.String()),
  }),
  ctx: MBaseContext.schema,
});