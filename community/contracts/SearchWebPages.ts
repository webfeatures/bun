import { Feature, Type } from '../../core/feature';
import { MBaseContext } from '../logic/base-context';

export const { SearchWebPages } = Feature.exportContract({
  name: 'SearchWebPages',
  input: Type.Object({
    url: Type.String(),
  }),
  output: Type.Object({
    web_pages: Type.Array(Type.String()),
  }),
  ctx: MBaseContext.schema,
});