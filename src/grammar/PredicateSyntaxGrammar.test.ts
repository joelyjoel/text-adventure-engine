import {Grammar} from './Grammar';
import {NounPhraseGrammar} from './PredicateSyntaxGrammar';
import {ExamplePOSGrammar} from './ExamplePOSGrammar';
import {evaluateTree} from './Tree';
import {deepCompare} from '../util/deepCompare';

describe("Parsing noun phrases", () => {
  const G = Grammar.merge(NounPhraseGrammar, ExamplePOSGrammar);
  G.assertNoLooseNonTerminals();

  test.each([
    [
      'the red truck', 
      {noun: 'truck', plural:false, adjectives:['red'], article:'the'}
    ],
    [
      'a blue square', 
      {article: 'a', plural: false, adjectives:['blue'], noun:'square'}
    ],
    [
      'the pointy red trucks',
      {article: 'the', adjectives:['pointy', 'red'], noun: 'trucks', plural:true},
    ],
  ])('Parsing "%s"', (str:string, expectedEvaluation:any) => {
    const split = str.split(' ');
    expect(G.recognise(split)).toBe(true);

    const jsonExpectation = JSON.stringify(expectedEvaluation);
    const forest = G.parse(split);
    let foundMatch = false;
    for(let tree of forest.recursiveTrees({S: '_SimpleNounPhrase', from:0, to:split.length})) {
      const evaluation = evaluateTree(tree);
      if(deepCompare(evaluation, expectedEvaluation))
        foundMatch = true;
    }
    expect(foundMatch).toBe(true);
  });
});

