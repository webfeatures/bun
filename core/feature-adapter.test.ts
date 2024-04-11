import { Type } from '@sinclair/typebox';
import { expect, test } from "bun:test";
import { FeatureAdapter } from './feature-adapter';
import { FeatureContract } from './feature-contract';

const contract = FeatureContract.create({
  name: 'AddTwoNumbers',
  input: Type.Tuple([Type.Number(), Type.Number()]),
  output: Type.Number(),
  ctx: Type.Void(),
});

const adapter = FeatureAdapter.create({
  contract,
  async handler(arg) {
    arg.output = arg.input[0] + arg.input[1];
  }
});

test("run AddTwoNumbers from a feature adapter", async () => {
  const result = await adapter.execute({ input: [1, 2] });
  expect(result.output).toBe(3);
});