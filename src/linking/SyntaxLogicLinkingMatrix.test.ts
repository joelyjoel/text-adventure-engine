import { SyntaxLogicLinkingMatrix } from "./SyntaxLogicLinkingMatrix";
import { Predicate } from "../logic";
import { PredicateSyntax } from "../PredicateSyntax";
import { Adjective } from "../Adjective";
import { Noun } from "../Noun";

test('SyntaxLogicLinkingMatrix', () => {
  let predicate = new Predicate(1);
  let syntax = new PredicateSyntax('be a clown', ['subject']);
  console.log(syntax.symbol);
  let adj = new Adjective('clownly')
  let noun = new Noun('clown');
  let matrix = new SyntaxLogicLinkingMatrix;
  let meaning = {predicate, truth: 'T'}
  matrix.addLinkage({syntax, tense:'simple_present'}, meaning)
  matrix.addLinkage(adj, meaning)
  matrix.addLinkage(noun, meaning)

  expect(matrix.syntaxToMeaning(adj)).toMatchObject(meaning);
  expect(matrix.syntaxToMeaning(noun)).toMatchObject(meaning);
  expect(matrix.syntaxToMeaning({syntax, tense: 'simple_present'})).toMatchObject(meaning);

  expect(matrix.meaningToSyntaxs(meaning)).toHaveLength(3)
})