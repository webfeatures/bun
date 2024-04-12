import { load } from 'cheerio';

export const parseDOM = (html: string) => {
  return load(html, { xml: true });
}