import { Fetcher } from './community/logic/fetcher';
import { serviceGroup } from './generated/service-group';

const fetcher = new Fetcher();

const result = await serviceGroup.execute({
  host: '_',
  name: 'GetTitle',
  input: {
    url: 'https://www.google.com'
  },
  ctx: {
    fetch: fetcher.fetch.bind(fetcher)
  }
})

console.log(result.output);