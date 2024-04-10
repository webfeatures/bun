import type { FeatureAdapter, TFeatureAdapterExecutionPayload } from './feature-adapter';
import type { ModelSchema, ModelType } from './model';
import type { Service } from './service';

export type TServiceGroupOptions<Name extends string, Services extends TServices> = {
  name: Name;
  services?: Services;
}

export type TServiceGroupCreateOptions<Name extends string, Services extends TServices> = {
  name: Name;
  services?: (self: ServiceGroup<Name, any>) => Services;
}

export type TServices = { [key: string]: Service<any, any> };

export class ServiceGroup<Name extends string, Services extends TServices> {
  name: Name;
  services: Services;

  constructor(options: TServiceGroupOptions<Name, Services>) {
    this.name = options.name;
    this.services = options?.services || {} as Services;
  }

  export(): { [K in `SG${Name}`]: typeof this } {
    return { [`SG${this.name}`]: this } as { [K in `SG${Name}`]: typeof this };
  }

  static export<Name extends string, Services extends TServices>(options: TServiceGroupCreateOptions<Name, Services>) {
    return ServiceGroup.create(options).export();
  }

  static create<Name extends string, Services extends TServices>(options: TServiceGroupCreateOptions<Name, Services>) {
    const group = new ServiceGroup({ name: options.name });
    const services = options.services ? options.services(group) : {} as Services;
    group.services = services;
    return group as ServiceGroup<Name, Services>;
  }

  async execute<
    Host extends keyof Services,
    Service extends Services[Host],
    Name extends keyof Service['adapters'],
    Input extends Service['adapters'][Name]['contract']['input'],
    Output extends Service['adapters'][Name]['contract']['output'],
    Ctx extends Service['adapters'][Name]['contract']['ctx']
  >(payload: TFeatureAdapterExecutionPayload<Name, Host, Input, Ctx>) {
    const adapter = this.services[payload.host].adapters[payload.name];
    return adapter.execute(payload) as ReturnType<FeatureAdapter<string, string, ModelSchema<Input>, ModelSchema<Output>, ModelSchema<Ctx>>['execute']>;
  }
}