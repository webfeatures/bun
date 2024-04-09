import { Fetcher } from '../fetcher';
import { ReverseProxy } from '../reverse-proxy';
import type { TFeatureExecutionPaylod } from './feature';
import type { Service } from './service';

export type TPodContextOptions = {
  reverseProxy: ReverseProxy;
  fetcher: Fetcher;
}

export class PodContext {
  reverseProxy: ReverseProxy;
  fetcher: Fetcher;

  constructor(public options: TPodContextOptions) {
    this.reverseProxy = options.reverseProxy;
    this.fetcher = options.fetcher;
  }

  static create(options?: Partial<TPodContextOptions>) {
    const reverseProxy = options?.reverseProxy || ReverseProxy.create();
    const fetcher = options?.fetcher || Fetcher.create({ proxyUrl: reverseProxy.url });

    return new PodContext({ reverseProxy, fetcher });
  }

  async start() {
    await this.reverseProxy.start();
  }
}

export type TPodOptions<Services extends TServices> = {
  context?: PodContext
  define(self: Pod<any>): Services;
}

export type TServices = { [key: string]: Service<any, any> };

export class Pod<Services extends TServices> {
  context: PodContext;
  services: Services;

  constructor(options: TPodOptions<Services>) {
    this.context = options?.context || PodContext.create();
    this.services = options.define(this);
  }

  static create<Services extends TServices>(options: TPodOptions<Services>) {
    return new Pod(options);
  }

  async execute<
    Host extends keyof Services,
    Service extends Services[Host],
    Name extends keyof Service['instances'],
    Input extends Service['instances'][Name]['feature']['input']
  >(payload: TFeatureExecutionPaylod<Name, Host, Input>) {
    const feature = this.services[payload.host].instances[payload.name];
    return feature.execute(payload);
  }
}