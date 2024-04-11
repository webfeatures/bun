import { ServiceGroup } from '../core/service-group.js';

import s1 from '../community/services/google.com/_service.js';
import s2 from '../community/services/_/_service.js';

export const serviceGroup = ServiceGroup.create({
  name: 'Community',
  services: {
    ...s1.asNamedExport(),
    ...s2.asNamedExport()
  }
});

