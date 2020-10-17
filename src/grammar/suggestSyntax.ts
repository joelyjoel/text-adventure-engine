import {ParseForest} from './Grammar';
import {PredicateSyntaxGrammar} from './PredicateSyntaxGrammar';
import {preparePosTagParseTable} from '../wordnet/preparePosTagParseTable';
import {evaluateTree} from './Tree';
import {deconjugate} from '../morphology'

/** 
 * Use wordnet part-of-speech tagging and a context free grammar (CFG) to suggest possible PredicateSyntax objects for unseen sentences.
 */
export async function * suggestSyntax(str:string):AsyncGenerator<{verb:string, params:string[]}> {
  const forest = await wordnetParse(str);

  for(let tree of forest.recursiveTrees()) {
    const {verb, params} = evaluateTree(tree);
    yield {verb, params};
  }
}

export async function wordnetParse(str:string):Promise<ParseForest> {
  const words = str.split(' ');
  const preParseTable = await preparePosTagParseTable(words);
  
  return PredicateSyntaxGrammar.parse(words, preParseTable);
}
