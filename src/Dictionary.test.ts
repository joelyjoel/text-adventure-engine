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