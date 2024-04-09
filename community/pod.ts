import { Pod } from '../core/spec/pod';
import service from './services/_';

export const pod = Pod.create({
  define() {
    return {
      ...service.export()
    };
  }
});
