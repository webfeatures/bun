import { Server, type PrepareRequestFunction } from 'proxy-chain';

export class ReverseProxy {
  server: Server;

  private constructor(server: Server) {
    this.server = server;
  }

  get url() {
    return `http://localhost:${this.server.port}`;
  }

  static create(options?: {
    port?: number;
    host?: string;
    prepareRequestFunction?: PrepareRequestFunction;
    verbose?: boolean;
    authRealm?: unknown;
  }) {

    const server = new Server({
      port: options?.port || 8008,
      host: 'localhost',
      verbose: options?.verbose || false,
      prepareRequestFunction: options?.prepareRequestFunction,
      authRealm: options?.authRealm,
    });

    return new ReverseProxy(server);
  }

  setMapper(prepareRequestFunction?: PrepareRequestFunction) {
    this.server.prepareRequestFunction = prepareRequestFunction;
  }

  async start() {
    await this.server.listen(() => {
      console.log(`Reverse proxy server is listening on port ${this.server.port}`);
    });

    return this;
  }
};