import {Grammar} from './Grammar';
import {PredicateSyntaxGrammar} from './PredicateSyntaxGrammar';
import {NounPhraseGrammar} from './NounPhraseGrammar';
import {ExamplePOSGrammar} from './ExamplePOSGrammar';
import {evaluateTree} from './Tree';
// @ts-ignore
import {deepCompare, deepMatch} from '../util/deepCompare';

describe("Testing NounPhraseGrammar with hard-coded strings", () => {
  const G = Grammar.merge(NounPhraseGrammar, ExamplePOSGrammar);
  G.assertNoLooseNonTerminals();
  G.checkRules();

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

//describe("Testing PredicateSyntaxGrammar with hard-coded strings", () => {
  //const G = Grammar.merge(PredicateSyntaxGrammar, ExamplePOSGrammar);
  //G.assertNoLooseNonTerminals();
  //G.checkRules();

  //test.each([
    //[
      //'the green cat chases the blue fish',
      //{
        //verb: 'chase', 
        //params: ['subject', 'object'], 
        //tense:'simplePresent',
      //},
    //],
    //[
      //'I dance with you',
      //{verb: 'dance', params: ['subject', 'with']},
    //]
  //])( 
    //'Parsing "%s"',
    //(str:string, expectedEvaluation:any) => {
      //const split = str.split(' ');
      //expect(G.recognise(split)).toBe(true);

      //const forest = G.parse(split);
      //let foundMatch = false;
      //for(let tree of forest.recursiveTrees()) {
        //const evaluation = evaluateTree(tree);
        //if(deepMatch(expectedEvaluation, evaluation))
          //foundMatch = true;
      //}
      //expect(foundMatch).toBe(true);
    //}
  //)
//});
