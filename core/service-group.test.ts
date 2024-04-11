import { Type } from '@sinclair/typebox';
import { expect, test } from "bun:test";
import { FeatureAdapter } from './feature-adapter';
import { FeatureContract } from './feature-contract';
import { Service } from './service';
import { ServiceGroup } from './service-group';

const contract = FeatureContract.create({
  name: 'AddTwoNumbers',
  input: Type.Tuple([Type.Number(), Type.Number()]),
  output: Type.Number(),
  ctx: Type.Void(),
});

const { math } = Service.createNamedExport({
  host: 'math',
  adapters: {
    ...FeatureAdapter.createNamedExport({
      contract,
      async handler(arg) {
        arg.output = arg.input[0] + arg.input[1];
      }
    })
  },
});

const group = ServiceGroup.create({
  services: {
    math
  }
});

test("run AddTwoNumbers from a group instance", async () => {
  const result = await group.execute({ host: 'math', name: 'addTwoNumbers', input: [1, 2] });
  expect(result.output).toBe(3);
});