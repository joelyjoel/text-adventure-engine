import { SyntaxLogicLinkingMatrix } from "./SyntaxLogicLinkingMatrix";
import { Predicate, createPredicate } from "../logic";
import { PredicateSyntax } from "../PredicateSyntax";
import { Adjective } from "../Adjective";
import { Noun } from "../Noun";
import { barge_world_dict } from "../dictionaries/barge-world";

test('SyntaxLogicLinkingMatrix', () => {
  let predicate = createPredicate(1);
  let syntax = new PredicateSyntax('be a clown', ['subject']);
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

test('Creating a SyntaxLogicLinkingMatrix from an existing dictionary.', () => {
  let matrix = new SyntaxLogicLinkingMatrix({dictionary: barge_world_dict});

  for(let adj of barge_world_dict.adjectives) {
    let meaning = matrix.syntaxToMeaning(adj);
    if(!meaning)
      fail(`matrix couldn't map adjective (${adj.str}) to a logical meaning`);
    else
      expect(matrix.meaningToSyntaxs(meaning).length).toBeGreaterThan(0);
  }
  
  for(let noun of barge_world_dict.nouns) {
    let meaning = matrix.syntaxToMeaning(noun);
    if(!meaning)
      fail(`Matrix couldn't map noun (${noun.str}) to a logical meaning.`);
    else
      expect(matrix.meaningToSyntaxs(meaning).length).toBeGreaterThan(0);
  }
})

test.todo(
  "Write a test to check that SyntaxLogicLinkingMatrix correctly associates all the statement syntaxs in barge_world_dict."
)
