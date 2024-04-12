import { Type } from '@sinclair/typebox';
import { expect, test } from "bun:test";
import { FeatureAdapter } from '../../core/feature-adapter';
import { FeatureContract } from '../../core/feature-contract';

const contract = FeatureContract.create({
  name: 'AddTwoNumbers',
  input: Type.Tuple([Type.Number(), Type.Number()]),
  output: Type.Number(),
  ctx: Type.Object({
    add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
  }),
});

const implementation = FeatureAdapter.create({
  contract,
  async handler(arg) {
    arg.output = arg.ctx.add(arg.input[0], arg.input[1]);
  }
});

test("run AddTwoNumbers from a feature instance using a context", async () => {
  const result = await implementation.execute({
    input: [1, 2],
    ctx: {
      add(a, b) {
        return a + b
      }
    }
  });
  expect(result.output).toBe(3);
});