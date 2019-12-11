import { toCamelCase } from "./toCamelCase";

test('toCamelCase', () => {
  expect(toCamelCase('a big rhino', 'inA binBag'))
    .toBe('ABigRhinoInABinBag');
})