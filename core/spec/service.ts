import type { TSchema } from '@sinclair/typebox';
import { FeatureInstance, type TFeatureExecutionPaylod, type TFeatureInstanceOptions } from './feature';

export type TFeatureInstances = Record<string, FeatureInstance<any, any, any, any, any>>;

export type TServiceOptions<Host extends string, FeatureInstances extends TFeatureInstances> = {
  host: Host;
  define(self: Service<any, any>): FeatureInstances;
}

export class Service<Host extends string, FeatureInstances extends TFeatureInstances> {
  host: Host;
  instances: FeatureInstances;

  constructor(public options: TServiceOptions<Host, FeatureInstances>) {
    this.host = options.host;
    this.instances = options.define(this);
  }

  createInstance<Input extends TSchema, Output extends TSchema, Ctx extends TSchema, Name extends string, Host extends string>(options: Omit<TFeatureInstanceOptions<Input, Output, Ctx, Name, Host>, 'host'>) {
    return new FeatureInstance({
      ...options,
      host: this.host
    });
  }

  exportInstance<Input extends TSchema, Output extends TSchema, Ctx extends TSchema, Name extends string, Host extends string>(options: Omit<TFeatureInstanceOptions<Input, Output, Ctx, Name, Host>, 'host'>) {
    const instance = this.createInstance(options);
    return instance.export();
  }

  export(): { [K in Host]: typeof this } {
    return { [this.host]: this } as { [K in Host]: typeof this };
  }

  static create<Host extends string, FeatureInstances extends TFeatureInstances>(options: TServiceOptions<Host, FeatureInstances>) {
    return new Service(options);
  }

  async execute<Name extends keyof FeatureInstances, Input extends FeatureInstances[Name]['feature']['input']>(payload: Omit<TFeatureExecutionPaylod<Name, Host, Input>, 'host'>) {
    return this.instances[payload.name].execute(payload);
  }
};