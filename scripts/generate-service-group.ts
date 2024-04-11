import fs from 'node:fs';
import path from 'node:path';

const currentFolderPath = __dirname;
const generatedFolderPath = path.resolve(currentFolderPath, '../generated');

const serviceGroupPath = path.resolve(generatedFolderPath, 'service-group.ts');
const servicesFolderPath = path.resolve(currentFolderPath, '../community/services');

export const generateServiceGroup = () => {
  fs.writeFileSync(
    serviceGroupPath,
    `import { ServiceGroup } from '../core/service-group.js';\n\n`
  );

  let index = 0;

  const indices: string[] = [];

  for (const service of fs.readdirSync(servicesFolderPath)) {
    const servicePath = path.join(servicesFolderPath, service);
    if (!fs.lstatSync(servicePath).isDirectory()) continue;

    const serviceFilePath = path.resolve(servicePath, '_service.ts');
    if (!fs.existsSync(serviceFilePath)) {
      console.log(`Service ${service} does not have an _service.ts file`);
      continue;
    }

    index++;
    indices.push(`s${index}`);
    fs.appendFileSync(serviceGroupPath, `import s${index} from '../community/services/${service}/_service.js';\n`);
  }

  fs.appendFileSync(serviceGroupPath, '\n');

  fs.appendFileSync(
    serviceGroupPath,
    `export const serviceGroup = ServiceGroup.create({
  name: 'Community',
  services: {
${indices.map((indice) => `    ...${indice}.export()`).join(',\n')}
  }
});`
  );

  fs.appendFileSync(serviceGroupPath, '\n\n');
};


if (process.argv?.length) {
  generateServiceGroup();
}