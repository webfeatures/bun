import type { FeatureAdapter, TFeatureAdapterExecutionPayload } from './feature-adapter';
import type { ModelSchema } from './model';
import type { Service } from './service';

export type TServiceGroupOptions<Services extends TServices> = {
  services: Services;
}

export type TServiceGroupCreateOptions<Services extends TServices> = {
  services: Services;
}

export type TServices = { [key: string]: Service<any, any> };

export class ServiceGroup<Services extends TServices> {
  services: Services;

  constructor(options: TServiceGroupOptions<Services>) {
    this.services = options?.services || {} as Services;
  }

  static create<Services extends TServices>(options: TServiceGroupCreateOptions<Services>) {
    return new ServiceGroup(options);
  }

  hosts<Host extends keyof Services>() {
    return Object.keys(this.services) as Host[];
  }

  service<Host extends keyof Services>(host: Host): Services[Host] | never {
    if (!this.services[host]) throw new Error(`Service ${host as string} not found`);
    return this.services[host];
  }

  async execute<
    Host extends keyof Services,
    Service extends Services[Host],
    Name extends keyof Service['adapters'],
    Input extends Service['adapters'][Name]['contract']['input'],
    Output extends Service['adapters'][Name]['contract']['output'],
    Ctx extends Service['adapters'][Name]['contract']['ctx']
  >(payload: TFeatureAdapterExecutionPayload<Name, Host, Input, Ctx>) {
    const service = this.service(payload.host);
    const adapter = service.adapter(payload.name);
    return adapter.execute(payload) as ReturnType<FeatureAdapter<string, ModelSchema<Input>, ModelSchema<Output>, ModelSchema<Ctx>>['execute']>;
  }
}