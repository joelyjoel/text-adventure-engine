import { Dictionary } from "./Dictionary"

import { Adjective } from "./Adjective";
import { Noun } from "./Noun";

test("Dictionary includes noun statements", () => {
  const dict = new Dictionary;
  const noun = new Noun('fort');
  dict.addNoun(noun);
  expect(
    dict.statementSyntaxs.includes(noun.predicate.syntaxs[0])
  ).toBe(true);
})

test('Dictionary includes adjective statements', () => {
  const dict = new Dictionary;
  let myAdj = new Adjective('lofty');
  dict.addAdjective(myAdj);

  expect(dict.statementSyntaxs.includes(myAdj.predicate.syntaxs[0]))
    .toBe(true);
})

test('Constructing a noun', () => {
  let noun = new Noun('cat');
  expect(noun).toMatchObject({
    str: 'cat',
    phrasal: false,
  })
})

test('Constructing an adjective', () => {
  let adj = new Adjective('small');
  expect(adj).toMatchObject({
    str: 'small',
    phrasal: false,
  })
})

