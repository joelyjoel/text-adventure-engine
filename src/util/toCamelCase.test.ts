import { toCamelCase, splitCamelCase } from "./toCamelCase";

test('toCamelCase', () => {
  expect(toCamelCase('a big rhino', 'inA binBag'))
    .toBe('ABigRhinoInABinBag');
})

describe('parseCamelCase', () => {
  test.each([
    ['TheBigBear', ['the', 'big', 'bear']],
    ['OoohHello', ['oooh', 'hello']],
  ])('parseCamelCase("%s") = %o', (str:string, answer) => {
    expect(splitCamelCase(str)).toStrictEqual(answer);
  });
});
