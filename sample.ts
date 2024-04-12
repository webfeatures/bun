import { Fetcher } from './community/logic/fetcher';
import { serviceGroup } from './generated/service-group';

const fetcher = new Fetcher();

const result = await serviceGroup.execute({
  host: '_',
  name: 'countWords',
  input: {
    url: 'https://www.google.com',
    words: ['google', 'hi', 'search']
  },
  fetch: fetcher.fetch.bind(fetcher)
})

console.log(result.output);