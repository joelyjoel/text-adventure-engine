import { interpretNounPhrase } from "./interpretNounPhrase";
import { Dictionary } from "../Dictionary";

test('Interpretting a noun phrase', () => {
  const dict = new Dictionary().addNouns('dog').addAdjective('hairy');

  let interpretation = interpretNounPhrase('the hairy dog', dict);

  expect(interpretation).toBeTruthy();
  // This test could use some elaboration.
})