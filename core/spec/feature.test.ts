import { expect, test } from "bun:test";
import { Feature, FeatureInstance, Type } from './feature';

const { AddTwoNumbers } = Feature.export({
  name: 'AddTwoNumbers',
  input: Type.Tuple([Type.Number(), Type.Number()]),
  output: Type.Number(),
  ctx: Type.Void(),
});

const addTwoNumbers = FeatureInstance.create({
  host: 'math',
  feature: AddTwoNumbers,
  async handler(arg) {
    arg.output = arg.input[0] + arg.input[1];
  }
});

test("run AddTwoNumbers from a feature instance", async () => {
  const result = await addTwoNumbers.execute({ input: [1, 2] });
  expect(result.output).toBe(3);
});