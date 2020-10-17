import {VariableTable} from '../logic';
import {PredicateSyntaxGrammar, evaluateTree} from '../grammar';
import {preparePosTagParseTable} from '../wordnet/preparePosTagParseTable';

export async function * suggestInterpretations(str:string):AsyncGenerator<VariableTable> {
  const words = str.split(' ');

  const preParseTable = await preparePosTagParseTable(words);

  const forest = PredicateSyntaxGrammar.parse(words, preParseTable);

  let n = 0;
  for(let tree of forest.recursiveTrees()) {
    const info = evaluateTree(tree);
    n++;
  }
}
