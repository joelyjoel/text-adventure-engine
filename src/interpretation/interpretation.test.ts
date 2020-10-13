import { interpretNounPhrase, interpretParsedNounPhrase } from "./interpretNounPhrase";
import { Dictionary } from "../Dictionary";
import { interpretStatement, interpretParsedStatement } from "./interpretStatement";
import { Context } from "../Context";
import { parseStatement } from "../parsing/parseStatement";
import { TruthTable } from "../logic/TruthTable";
import { Noun } from "../Noun";
import { Adjective } from "../Adjective";
import { Sentence, VariableTable, Predicate, Entity, isEntity } from "../logic";
import { parseNounPhrase } from "../parsing/parseNounPhrase";

test('Interpretting a noun phrase', () => {
  const dict = new Dictionary().addNouns('dog').addAdjective('hairy');

  let interpretation = interpretNounPhrase('the hairy dog', dict);

  if(interpretation)
    expect(interpretation.table).toBeInstanceOf(VariableTable)
  else
    fail('Interpretation failed (null)')
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
    expect(interpretation.lookUp(
      {predicate: ctx.linkingMatrix.syntaxToMeaningOrCrash(noun).predicate, args:[e]}
    )).toBe('T')
    expect(interpretation.lookUp({
      predicate: ctx.linkingMatrix.syntaxToMeaningOrCrash(adj).predicate, 
      args: [e],
    })).toBe('T')
  }
})

test('Interpretting a complex noun phrase', () => {
  const dict = new Dictionary().addNouns('boy').addAdjectives('fat', 'round');
  const ctx = new Context(dict);

  let str = 'the boy which is fat';
  let parse = parseNounPhrase(str, dict);
  if(parse) {
    let claim = interpretParsedNounPhrase(parse, ctx);
    expect(claim).toBeTruthy();
  } else fail(`Unable to parse: ${str}`)

  let str2 = 'the boy which is fat is round';
  let [parse2] = parseStatement(str2, ctx)
  if(parse2) {
    let claim = interpretParsedStatement(parse2, ctx);
    expect(claim).toBeTruthy();
    // console.log(`"${str2}":\n${claim.symbol}`)
  } else fail(`Unable to parse: ${str2}`)
})

test.each(
  ['Henry', 'Henry The Hoover']
)('Interpreting Proper Noun: %s', propernoun => {
  const dict = new Dictionary();
  const ctx = new Context(dict)

  let interpretation = interpretNounPhrase(propernoun, ctx);

  if(interpretation)
    expect(isEntity(interpretation.returns)).toBe(true);
  else
    fail(`Interpretation is null.`)

  // Check for consistency.
  let interpretation2 = interpretNounPhrase(propernoun, ctx);
  if(interpretation2 && interpretation)
    expect(interpretation2.returns).toBe(interpretation.returns)
})

test.each([
  'I', 'you', 'me',
])('Interpreting Pronoun: %s', pronoun => {
  const dict = new Dictionary();
  const ctx = new Context(dict);

  let interpretation = interpretNounPhrase(pronoun, ctx);

  // console.log(interpretation);

  if(interpretation)
    expect(isEntity(interpretation.returns)).toBe(true);
  else
    fail(`Interpretation of '${pronoun}' failed.`);
})
