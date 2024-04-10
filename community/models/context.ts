import { Type } from '@sinclair/typebox';
import { Model } from '../../core/model';

export const { MContext } = Model.export({
  name: 'Context',
  schema: Type.Object({
    baseUrl: Type.String(),
  })
});