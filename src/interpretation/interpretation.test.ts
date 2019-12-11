import { interpretNounPhrase } from "./interpretNounPhrase";
import { Dictionary } from "../Dictionary";
import { interpretStatement, interpretParsedStatement } from "./interpretStatement";
import { Context } from "../Context";
import { parseStatement } from "../parsing/parseStatement";
import { TruthTable } from "../logic/TruthTable";
import { Noun } from "../Noun";
import { Adjective } from "../Adjective";
import { Sentence, VariableTable } from "../logic";

test('Interpretting a noun phrase', () => {
  const dict = new Dictionary().addNouns('dog').addAdjective('hairy');

  let interpretation = interpretNounPhrase('the hairy dog', dict);

  expect(interpretation).toBeTruthy();
  expect(interpretation).toBeInstanceOf(VariableTable)
  // This test could use some elaboration.
})

test("Interpretting a statement", () => {
  const noun = new Noun('dutch barge');
  const adj = new Adjective('warm');
  const dict = new Dictionary().addNouns(noun).addAdjective(adj);
  const ctx = new Context(dict);

  let [parse] = parseStatement('the dutch barge is warm', ctx);
  expect(parse).toBeTruthy();

  let interpretation = interpretParsedStatement(parse, ctx);

  expect(interpretation).toBeTruthy();
  expect(interpretation).toBeInstanceOf(VariableTable)

  if(interpretation instanceof TruthTable) {
    expect(interpretation.length).toBeGreaterThan(1);
    expect(interpretation.entities.length).toBe(1);

    let [e] = interpretation.entities;
    expect(interpretation.lookUp(new Sentence(noun.predicate, e))).toBe('true')
    expect(interpretation.lookUp(new Sentence(adj.predicate, e))).toBe('true')
  }
})