import { expect, test } from "bun:test";
import { Feature, Type } from './feature';
import { Service } from './service';

const AddTwoNumbers = Feature.create({
  name: 'AddTwoNumbers',
  input: Type.Tuple([Type.Number(), Type.Number()]),
  output: Type.Number(),
  ctx: Type.Void(),
});

const service = Service.create({
  host: 'math',
  define(s) {
    return {
      addTwoNumbers: s.createInstance({
        feature: AddTwoNumbers,
        async handler(arg) {
          const { input } = arg;
          arg.output = input[0] + input[1];
        }
      })
    }
  }
});

test("execute an instance", async () => {
  const result = await service.execute({ name: 'addTwoNumbers', input: [1, 2] });
  expect(result.output).toBe(3);
});