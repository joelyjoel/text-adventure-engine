import * as r from '../util/regops.extended';
import {EntityRegex, PredicateRegex, VariableRegex, isEntity, isPredicate} from './basics'

export const SentenceRegex = /(?<p>\w+\/\d+)\((?<args>\w+(\s*,\s*\w+)*)?\)/;
export const wholeSentenceRegex = r.whole(SentenceRegex);

export function parseArgs(str:string) {
  let args = str.split(/\s*,\s*/);
  if(args.every(arg => isEntity(arg)))
    return args;
  else 
    return null;
}

export function parseSentence(str:string) {
  const parse = wholeSentenceRegex.exec(str);
  if(parse) {
    const groups = parse.groups;
    if(!groups)
      return null;
    const predicate = groups.p;
    const args = parseArgs(groups.args);

    if(args && isPredicate(predicate))
      return {args, predicate}
    else
      return null;
  } else 
    return null;
}

export function quickSentence(str:string) {
  let parse = parseSentence(str);
  if(parse)
    return parse;
  else 
    throw 'Unable to parse logical sentence: '+str;
}

export function parseAssignment(str:string) {
  const [a, b] = str.split('=').map(side => side.trim());
  const sentence = parseSentence(a);
  const truth = /^\w+/.test(b) ? b : null;
  if(sentence && truth)
    return {sentence, truth};
  else return null;
}

//export function logic(str:string) {
  //return parseVariableTable(str) || parseTable(str) || parseAssignment(str) || parseSentence(str);
//}
