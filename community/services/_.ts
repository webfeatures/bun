import { Service } from '../../core/spec/service';
import { GetTitle } from '../features/GetTitle';

const service = Service.create({
  host: '_',
  define(self) {
    return {
      ...self.exportInstance({
        feature: GetTitle,
        handler: async ({ input, output }) => {
          const { url } = input;
          const response = await fetch(url);
          const html = await response.text();

          const title = html.split('<title>')?.[1]?.split?.('</title>')?.[0];
          output.title = title;
        }
      })
    }
  }
});

export default service;