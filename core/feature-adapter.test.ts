import { expect, test } from "bun:test";
import { Feature, Type } from './feature';

const contract = Feature.createContract({
  name: 'AddTwoNumbers',
  input: Type.Tuple([Type.Number(), Type.Number()]),
  output: Type.Number(),
  ctx: Type.Void(),
});

const adapter = Feature.createAdapter({
  host: 'math',
  contract,
  async handler(arg) {
    arg.output = arg.input[0] + arg.input[1];
  }
});

test("run AddTwoNumbers from a feature adapter", async () => {
  const result = await adapter.execute({ input: [1, 2] });
  expect(result.output).toBe(3);
});