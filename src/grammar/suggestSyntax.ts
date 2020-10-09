import {PredicateSyntaxGrammar} from './PredicateSyntaxGrammar';
import {preparePosTagParseTable} from '../wordnet/preparePosTagParseTable';
import {evaluateTree} from './Tree';
import {deconjugate} from '../morphology'

/** 
 * Use wordnet part-of-speech tagging and a context free grammar (CFG) to suggest possible PredicateSyntax objects for unseen sentences.
 */
export async function * suggestSyntax(str:string):AsyncGenerator<{verb:string, params:string[]}> {
  const words = str.split(' ');

  // Do pos tagging
  const preParseTable = await preparePosTagParseTable(words);

  // Parse using grammar
  const forest = PredicateSyntaxGrammar.parse(words, preParseTable);

  for(let tree of forest.recursiveTrees()) {
    const {verb, params} = evaluateTree(tree);
    yield {verb, params};
  }
}
