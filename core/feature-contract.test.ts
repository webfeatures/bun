import { expect, test } from "bun:test";
import { Feature, Type } from './feature';

const contract = Feature.createContract({
  name: 'AddTwoNumbers',
  input: Type.Tuple([Type.Number(), Type.Number()]),
  output: Type.Number(),
  ctx: Type.Void(),
});

test("parse input using AddTwoNumbers contract", async () => {
  const data: [number, number] = [1, 2];
  const input = contract.input.parse(data);
  expect(input).toEqual(data);
});