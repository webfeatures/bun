import { type Static, type TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

export abstract class AbstractModel<Name, Schema, Type> {
  abstract name: Name;
  abstract schema: Schema;

  abstract type(data: Type): Type;
  abstract create(): any;
  abstract parse(data: Type): Type;
  abstract validate(data: Type): boolean;
  abstract errors(data: Type): any;
}

export type TModelOptions<Name extends string, Schema extends TSchema> = {
  name: Name;
  schema: Schema;
};

export type ModelType<T> = T extends Model<infer Name, infer Schema, infer Type> ? Type : never;
export type ModelSchema<T> = T extends Model<infer Name, infer Schema, infer Type> ? Schema : never;

export class Model<Name extends string = string, Schema extends TSchema = TSchema, Type = Static<Schema>> implements AbstractModel<Name, Schema, Type> {
  name: Name;
  schema: Schema;

  constructor(model: { name: Name; schema: Schema; }) {
    this.name = model.name;
    this.schema = model.schema;
    this.schema.$id = this.name;
  }

  type(data: Type): Type {
    return data;
  };

  create() {
    return Value.Create(this.schema);
  }

  parse(data: Type) {
    return Value.Cast(this.schema, data) as Type;
  }

  validate(data: Type) {
    return Value.Check(this.schema, data);
  }

  errors(data: Type) {
    return Value.Errors(this.schema, data);
  }

  export() {
    return { [`M${this.name}`]: this } as { [K in `M${Name}`]: typeof this };
  }

  static create<Name extends string, Schema extends TSchema>(model: TModelOptions<Name, Schema>) {
    return new Model(model);
  }

  static export<Name extends string, Schema extends TSchema>(model: TModelOptions<Name, Schema>) {
    return Model.create(model).export();
  }
};