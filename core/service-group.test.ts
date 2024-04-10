import { expect, test } from "bun:test";
import { Feature, Type } from './feature';
import { Service } from './service';
import { ServiceGroup } from './service-group';

const contract = Feature.createContract({
  name: 'AddTwoNumbers',
  input: Type.Tuple([Type.Number(), Type.Number()]),
  output: Type.Number(),
  ctx: Type.Void(),
});

const { math } = Service.export({
  host: 'math',
  adapters(s) {
    return {
      ...s.exportAdapter({
        contract,
        async handler(arg) {
          const { input } = arg;
          arg.output = input[0] + input[1];
        }
      })
    }
  }
});

const group = ServiceGroup.create({
  name: 'group',
  services() {
    return { math };
  }
});

test("run AddTwoNumbers from a group instance", async () => {
  const result = await group.execute({ host: 'math', name: 'AddTwoNumbers', input: [1, 2] });
  expect(result.output).toBe(3);
});