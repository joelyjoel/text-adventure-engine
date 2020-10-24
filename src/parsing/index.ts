/** 
 * Kinda @deprecated, just kept here because it broke some unit tests to remove it.
 */
export const properNounRegex = /^[A-Z]\w*(?: [A-Z]\w*)*$/;


import {
  NounPhraseParse, 
  PredicateSyntaxParse, 
  assertIsPredicateSyntaxParse, 
  assertIsNounPhraseParse
} from '../grammar/parseTypings';
import {preparePosTagParseTable} from '../wordnet';
import {NounPhraseGrammar} from '../grammar/NounPhraseGrammar';
import {PredicateSyntaxGrammar} from '../grammar/PredicateSyntaxGrammar';
import {evaluateTree} from '../grammar';

// NOTE: Keep updating this function with whatever is the best version
export async function * parseNounPhrase(str:string):AsyncGenerator<NounPhraseParse> {
  const words = str.split(' ');
  const preParseTable = await preparePosTagParseTable(words);
  const forest = NounPhraseGrammar.parse(words, preParseTable);
  for(let tree of forest.recursiveTrees()) {
    const parse = evaluateTree(tree);
    if(assertIsNounPhraseParse(parse))
      yield parse;
  }
}

// NOTE: Keep updating this function with whatever is the best version
export async function *parseSentence(str:string):AsyncGenerator<PredicateSyntaxParse> {
  const words = str.split(' ');
  const preParseTable = await preparePosTagParseTable(words);
  const forest = PredicateSyntaxGrammar.parse(words, preParseTable);
  for(let tree of forest.recursiveTrees()) {
    const parse = evaluateTree(tree);
    if(assertIsPredicateSyntaxParse(parse))
      yield parse;
  }
}

