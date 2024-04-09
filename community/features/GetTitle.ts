import { Feature, Type } from '../../core/spec/feature';

export const { GetTitle } = Feature.export({
  name: 'GetTitle',
  input: Type.Object({
    url: Type.String(),
  }),
  output: Type.Object({
    title: Type.String(),
  }),
  ctx: Type.Object({}),
});