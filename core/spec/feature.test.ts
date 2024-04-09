import { expect, test } from "bun:test";
import { Feature, Type } from './feature';

const AddTwoNumbers = Feature.create({
  name: 'AddTwoNumbers',
  input: Type.Tuple([Type.Number(), Type.Number()]),
  output: Type.Number(),
  ctx: Type.Void(),
});

const addTwoNumbers = AddTwoNumbers.createInstance({
  host: 'math',
  async handler(arg) {
    const { input } = arg;
    arg.output = input[0] + input[1];
  }
})

test("execute an instance", async () => {
  const result = await addTwoNumbers.execute({ input: [1, 2] });
  expect(result.output).toBe(3);
});