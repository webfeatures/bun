import { expect, test } from "bun:test";
import { Feature, Type } from './feature';
import { Service } from './service';

const { AddTwoNumbers } = Feature.export({
  name: 'AddTwoNumbers',
  input: Type.Tuple([Type.Number(), Type.Number()]),
  output: Type.Number(),
  ctx: Type.Void(),
});

const { SubtractTwoNumbers } = Feature.export({
  name: 'SubtractTwoNumbers',
  input: Type.Tuple([Type.Number(), Type.Number()]),
  output: Type.Number(),
  ctx: Type.Void(),
});

const service = Service.create({
  host: 'math',
  define(s) {
    return {
      ...s.exportFeatureInstance({
        feature: AddTwoNumbers,
        async handler(arg) {
          const { input } = arg;
          arg.output = input[0] + input[1];
        }
      }),
      ...s.exportFeatureInstance({
        feature: SubtractTwoNumbers,
        async handler(arg) {
          const { input } = arg;
          arg.output = input[0] - input[1];
        }
      })
    }
  }
});

test("run AddTwoNumbers from a service instance", async () => {
  const result = await service.execute({ name: 'AddTwoNumbers', input: [1, 2] });
  expect(result.output).toBe(3);
});

test("run SubtractTwoNumbers from a service instance", async () => {
  const result = await service.execute({ name: 'SubtractTwoNumbers', input: [1, 2] });
  expect(result.output).toBe(-1);
});