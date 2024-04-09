import { expect, test } from "bun:test";
import { Feature, Type } from './feature';
import { Pod } from './pod';
import { Service } from './service';

const { AddTwoNumbers } = Feature.export({
  name: 'AddTwoNumbers',
  input: Type.Tuple([Type.Number(), Type.Number()]),
  output: Type.Number(),
  ctx: Type.Void(),
});

const service = Service.create({
  host: 'math',
  define(s) {
    return {
      ...s.exportInstance({
        feature: AddTwoNumbers,
        async handler(arg) {
          const { input } = arg;
          arg.output = input[0] + input[1];
        }
      })
    }
  }
});

const pod = Pod.create({
  define() {
    return {
      math: service
    }
  }
});

test("execute an instance", async () => {
  const result = await pod.execute({ host: 'math', name: 'AddTwoNumbers', input: [1, 2] });
  expect(result.output).toBe(3);
});