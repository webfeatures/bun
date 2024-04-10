import { Feature, Type } from '../../core/feature';
import { MBaseContext } from '../logic/base-context';

export const { GetTitle } = Feature.exportContract({
  name: 'GetTitle',
  input: Type.Object({
    url: Type.String(),
  }),
  output: Type.Object({
    title: Type.String(),
  }),
  ctx: MBaseContext.schema,
});