import {VariableTable} from '../logic';
import {PredicateSyntaxGrammar, evaluateTree} from '../grammar';
import {preparePosTagParseTable} from '../wordnet/preparePosTagParseTable';
import {createPredicateSyntaxPredicate} from './linking';

export async function * suggestInterpretations(str:string):AsyncGenerator<VariableTable> {
  const words = str.split(' ');

  const preParseTable = await preparePosTagParseTable(words);

  const forest = PredicateSyntaxGrammar.parse(words, preParseTable);

  for(let tree of forest.recursiveTrees()) {
    const info  = evaluateTree(tree);
    interpretParseEvaluation(info);
  }
}

export function interpretParseEvaluation({verb, params, args}:any) {
  const table = new VariableTable();;
  //for(let arg of args)
    //table.add(interpretNounPhraseEvaluation(arg));
  const predicate = createPredicateSyntaxPredicate({verb, params});
}


export async function interpretNounPhraseEvaluation(np:any) {
}
