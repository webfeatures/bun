import type { FeatureAdapter, TFeatureAdapterExecutionPayload } from './feature-adapter';
import type { ModelSchema } from './model';
import type { Service } from './service';

export type TServiceGroupOptions<Name extends string, Services extends TServices> = {
  name: Name;
  services?: Services;
}

export type TServiceGroupCreateOptions<Name extends string, Services extends TServices> = {
  name: Name;
  services?: Services;
}

export type TServices = { [key: string]: Service<any, any> };

export class ServiceGroup<Name extends string, Services extends TServices> {
  name: Name;
  services: Services;

  constructor(options: TServiceGroupOptions<Name, Services>) {
    this.name = options.name;
    this.services = options?.services || {} as Services;
  }

  asNamedExport(): { [K in `SG${Name}`]: typeof this } {
    return { [`SG${this.name}`]: this } as { [K in `SG${Name}`]: typeof this };
  }

  static create<Name extends string, Services extends TServices>(options: TServiceGroupCreateOptions<Name, Services>) {
    return new ServiceGroup(options);
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
    return adapter.execute(payload) as ReturnType<FeatureAdapter<string, ModelSchema<Input>, ModelSchema<Output>, ModelSchema<Ctx>>['execute']>;
  }
}