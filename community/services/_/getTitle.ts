import { FeatureAdapter } from '../../../core';
import { GetTitle } from '../../contracts/GetTitle';

export const { getTitle } = FeatureAdapter.createNamedExport({
  contract: GetTitle,
  async handler({ input, output, ctx }) {
    const { url } = input;
    const response = await ctx.fetch({ url });
    // const html = response?.body ? Buffer.from(response?.body as any).toString('utf-8') : '';
    const html = response?.data as string;
    if (!html) return;

    const title = html.split('<title>')?.[1]?.split?.('</title>')?.[0];
    output.title = title;
  }
});