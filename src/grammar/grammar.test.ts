import {Grammar} from './Grammar';
import {parseRule} from './quickGrammar';
import {readFile} from 'fs';
import * as path from 'path';
import {PredicateSyntax} from '../PredicateSyntax';
import {preparePosTagParseTable} from '../wordnet';
import {allTenses} from '../util/tense';
import {evaluateTree, flattenTree, rewindParseTreeSymbols} from './Tree'
import {IndexedGrammar} from './IndexedGrammar';

describe('Testing Grammar', () => {
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

  test.todo("Executing a parse tree from a function grammar");

  describe('Comparing Trees', () => {
    const [...trees] = fishGrammar.recursiveTrees();

    test('Comparison positive for testing trees against themselves', () => {
      for(let tree of trees)
        expect(fishGrammar.compareTrees(tree, tree)).toBe(true);
    });

    test.todo('Comparison is positive when testing trees against deep clones of themseelves')

    test('Comparison is negative when testing trees with different strings', () => {
      for(let i=0; i < trees.length-1; ++i) {
        const str1 = flattenTree(trees[i]).join(' ');
        for(let j=i+1; j < trees.length; ++j) {
          const str2 = flattenTree(trees[j]).join(' ');
          if(str1 == str2)
            // skip test because trees might be duplicates
            continue;
          else
            expect(fishGrammar.compareTrees(trees[i], trees[j])).toBe(false);
        }
      }
    });
  });

  describe('Evaluating Trees', () => {
    // Create a function grammar
    const GrAYmmer = Grammar.quick({
      '_np -> the _noun': noun => ({
        noun,
        adjectives: [],
      }),

      '_np -> the _adjlist _noun': (adjectives, noun) => ({
        adjectives, 
        noun
      }),

      '_noun -> twink;bear;daddy;queen': T => T,
      '_adjective -> basic;hungry;': T =>T,

      '_adjlist -> _adjective': adj => [adj],
      '_adjlist -> _adjective _adjective': (...args) => args, 
    });

    describe('Evaluating/recognising/parsing trees generated from a string grammar', () => {
      const trees = GrAYmmer.recursiveTrees();
      for(let tree of trees) {
        const str = flattenTree(tree);

        test(`Recognising string "${str.join(' ')}" as belonging to the grammar`, () => {
          expect(GrAYmmer.recognise(str)).toBe(true);
        });

        test(`(Re-)Parsing string "${str.join(' ')}" produces original tree`, () => {
          const forest = GrAYmmer.parse(str);
          let foundMatch = false;
          for(let parseTree of forest.recursiveTrees()) {
            // Rewind the parse tree
            const rewindedTree = rewindParseTreeSymbols(parseTree);
            if(GrAYmmer.compareTrees(rewindedTree, tree)) {
              foundMatch = true;
              break;
            }
            expect(foundMatch).toBe(true);
          }
        });

        test(`Evaluating "${str.join(' ')}"`, () => {
          const evaluation = evaluateTree(tree);
          expect(evaluation).toBeTruthy();
          expect(evaluation).toHaveProperty('noun');
          expect(evaluation).toHaveProperty('adjectives');
          expect(evaluation.noun).toBe(str[str.length-1]);
          expect(evaluation.adjectives).toEqual(str.slice(1, -1));
        });

            }

      test.todo("Returning null anuls the whole tree");
      test.todo("nulled trees are ignored");
    });

    test('Stringifying trees', () => {
      const forest = GrAYmmer.recursiveTrees();
      for(let tree of forest) {
        GrAYmmer.stringifyTree(tree);
      }
    });

  });
});
