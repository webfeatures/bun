import { Type } from '@sinclair/typebox';
import { expect, test } from "bun:test";
import { FeatureAdapter } from './feature-adapter';
import { FeatureContract } from './feature-contract';
import { Service } from './service';

const { AddTwoNumbers } = FeatureContract.createNamedExport({
  name: 'AddTwoNumbers',
  input: Type.Tuple([Type.Number(), Type.Number()]),
  output: Type.Number(),
  ctx: Type.Void(),
});

const { SubtractTwoNumbers } = FeatureContract.createNamedExport({
  name: 'SubtractTwoNumbers',
  input: Type.Tuple([Type.Number(), Type.Number()]),
  output: Type.Number(),
  ctx: Type.Void(),
});

const service = Service.create({
  host: 'math.com',
  adapters: {
    ...FeatureAdapter.createNamedExport({
      contract: AddTwoNumbers,
      async handler(arg) {
        const { input } = arg;
        arg.output = input[0] + input[1];
      }
    }),
    ...FeatureAdapter.createNamedExport({
      contract: SubtractTwoNumbers,
      async handler(arg) {
        const { input } = arg;
        arg.output = input[0] - input[1];
      }
    })
  }
});

test("run AddTwoNumbers from a service instance", async () => {
  const result = await service.execute({ name: 'addTwoNumbers', input: [1, 2] });
  expect(result.output).toBe(3);
});

test("run SubtractTwoNumbers from a service instance", async () => {
  const result = await service.execute({ name: 'subtractTwoNumbers', input: [1, 2] });
  expect(result.output).toBe(-1);
});