import { interpretNounPhrase, interpretParsedNounPhrase } from "./interpretNounPhrase";
import { Dictionary } from "../Dictionary";
import { interpretStatement, interpretParsedStatement } from "./interpretStatement";
import { Context } from "../Context";
import { parseStatement } from "../parsing/parseStatement";
import { TruthTable } from "../logic/TruthTable";
import { Noun } from "../Noun";
import { Adjective } from "../Adjective";
import { Sentence, VariableTable } from "../logic";
import { parseNounPhrase } from "../parsing/parseNounPhrase";

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
    expect(interpretation.lookUp(new Sentence(noun.predicate, e))).toBe('T')
    expect(interpretation.lookUp(new Sentence(adj.predicate, e))).toBe('T')
  }
})

test('Interpretting a complex noun phrase', () => {
  const dict = new Dictionary().addNouns('boy').addAdjectives('fat', 'round');
  const ctx = new Context(dict);

  let str = 'the boy which is fat';
  let parse = parseNounPhrase(str, dict);
  if(parse) {
    let claim = interpretParsedNounPhrase(parse, ctx);
    console.log(`"${str}": ${claim.symbol}`)
    expect(claim).toBeTruthy();
  } else fail(`Unable to parse: ${str}`)

  let str2 = 'the boy which is fat is round';
  let [parse2] = parseStatement(str2, ctx)
  if(parse2) {
    let claim = interpretParsedStatement(parse2, ctx);
    expect(claim).toBeTruthy();
    console.log(`"${str2}":\n${claim.symbol}`)
  } else fail(`Unable to parse: ${str2}`)
})