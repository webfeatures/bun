import { Service } from '../../../core/service';
import { getTitle } from './getTitle';

export default Service.create({
  host: '_',
  adapters: {
    getTitle,
  }
});