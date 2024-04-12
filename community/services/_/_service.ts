import { Service } from '../../../core/service';
import { FeatureAdapter } from '../../../core';
import { CountWords } from '../../contracts/CountWords';
import { parseDOM } from '../../logic/dom';

const { countWords } = FeatureAdapter.createNamedExport({
  contract: CountWords,
  async handler({ input, output, fetch }) {
    const { url } = input;
    const response = await fetch({ url });
    const html = response?.data as string;
    if (!html) return;

    const $ = parseDOM(html);


    for (const word of input.words) {
      output.words[word] = $(`*:contains("${word}")`).length;
    }
  },
});

export default Service.create({
  host: '_',
  adapters: {
    countWords,
  }
});