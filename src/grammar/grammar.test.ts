import {Grammar} from './Grammar';
import {parseRule} from './quickGrammar';
import {readFile} from 'fs';
import * as path from 'path';
import {PredicateSyntax} from '../PredicateSyntax';
import {preparePosTagParseTable} from '../wordnet';
import {allTenses} from '../util/tense';
import {evaluateTree, flattenTree} from './Tree'

let G:Grammar<string>
beforeAll(() => new Promise(fulfil => {
  const grammarPath = path.resolve(__dirname, 'grammar.txt');
  readFile(grammarPath, 'utf-8', (err, src) => {
    G = Grammar.quick(src);
    fulfil();
  });
}))

test("Parsing grammar rule strings", () => {
  expect(parseRule('_np -> the _noun')).toEqual({
    head: '_np',
    bodies: [['the', '_noun']],
  });

  expect(parseRule('_noun -> cat;fish;dog')).toEqual({
    head: '_noun',
    bodies: [['cat'], ['fish'], ['dog']],
  })
});

test("Constructing a simple grammar. (Grammar.quick(src) function)", () => {
  const g = Grammar.quick(`
    _np -> the _noun
    _noun -> cat;fish;dog
  `);

  expect(g.numberOfRules).toBeGreaterThan(0);
  expect(g.nonTerminalRules.length).toBeGreaterThanOrEqual(1);
  expect(g.terminalRules.length).toBeGreaterThanOrEqual(3);
  
  const allNonTerminals = g.listAllNonTerminals();
  const topNonTerminals = g.listTopNonTerminals();

  expect(allNonTerminals).toContain('_np');
  expect(allNonTerminals).toContain('_noun');
  expect(topNonTerminals).toContain('_np');
});


// NOTE : DONT EDIT OR YOU WILL BREAK THE TESTS
const fishGrammar = Grammar.quick(`
  _np -> the _adjective _noun
  _np -> the _noun
  _noun -> mackeral;cod;salmon
  _adjective -> big;small;fluffy;austere
`)


test("Recognising strings that belong to the grammar", () => {
  expect(fishGrammar.recognise('the salmon'.split(' '))).toBe(true);
  expect(fishGrammar.recognise('the fluffy mackeral'.split(' '))).toBe(true)
  expect(fishGrammar.recognise('the austere cod'.split(' '))).toBe(true);

  // not in grammar
  expect(fishGrammar.recognise('the red herring'.split(' '))).toBe(false);
});

test.skip("Parsing strings randomly produced by same grammar", () => {
  for(let i=0; i<5; ++i) {
    let str = fishGrammar.randomSubstitution();
    expect(fishGrammar.recognise(str)).toBe(true);
  }
});

test.skip("Grammar.prototype.recursiveSubstitutions", () => {
  let n = 0;
  for(let str of fishGrammar.recursiveSubstitutions())
    if(n++ > 25)
      break;
    else
      expect(fishGrammar.recognise(str)).toBe(true);
});

describe.skip("Parsing strings composed by PredicateSyntax objects", () => {
  const sentences = [
    {
      P: new PredicateSyntax("eat", ['subject', 'object']),
      args: ['the cat', 'the fish'],
    },
    {
      P: new PredicateSyntax('cling', ['subject', 'to']),
      args: ['the ivy', 'the wall']
    },
  ]

  for(let {P, args} of sentences)
    for(let tense of allTenses) {
      let str = P.str(args, {tense}).split(' ');
      test(`${P.symbol}[${args.join(', ')}] in ${tense}: "${str.join(' ')}"`, async () => {
        const preParseTable = await preparePosTagParseTable(str);
        expect(G.recognise(str, preParseTable)).toBe(true);
      });
    }
});

test('Producing recursive annotation trees', () => {
  const [...trees] = fishGrammar.recursiveAnnotations();
  expect(trees.length).toBeGreaterThanOrEqual(1);
  for(let tree of trees) {

  }
});

test.todo("Executing a parse tree from a function grammar");

describe('Executing recursively generated trees without error.', () => {
  const [...trees] = fishGrammar.recursiveTrees();
  for(let tree of trees) {
    const str = flattenTree(tree).join(' ');
    test(`evaluating "${str}"`, () => {
      const evaluated = evaluateTree(tree);
      expect(evaluated).toBeTruthy()
    })
  }
});

