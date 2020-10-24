import * as r from '../util/regops.extended';
import {EntityRegex, PredicateRegex, VariableRegex, isEntity, isPredicate, TruthTable, VariableTable} from './'

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

export function parseAssignment(str:string) {
  const [a, b] = str.split('=').map(side => side.trim());
  const sentence = parseSentence(a);
  const truth = /^\w+/.test(b) ? b : null;
  if(sentence && truth)
    return {sentence, truth};
  else return null;
}

export function parseTable(str:string) {
  if(str[0] != '{' || str[str.length-1] != '}')
    return null;

  const lines = str.slice(1, -1).split(/[\&\n]/)
    .map(nosehair => nosehair.trim())
    .filter(line => line.length)
  
  const assignments = lines.map(line => parseAssignment(line));
  
  const table = new TruthTable<string>();
  for(let assignment of assignments) {
    if(!assignment)
      return null;

    table.assign(assignment.sentence, assignment.truth);
  }
  return table;
}

export function parseVariableTable(str:string) {
  const reg = /(there exists|∃) \(?(?<vars>.+)\)? (s\.t\.|such that) (?<body>{.+})/is;
  const info = reg.exec(str);
  if(info) {
    const groups = info.groups;
    if(groups) {
      let vars = parseArgs(groups.vars);
      let body = parseTable(groups.body);

      if(vars && body) {
        let claim = new VariableTable<string>(...vars);
        claim.merge(body);
        return claim;
      } else
        return null;
    } else 
      return null;
  } else 
    return null;
}

/**
 * Make a truth table, with quick convenience!
 */
export function quickTruthTable(src:string):TruthTable<string> {
  const table = parseTable(src);
  if(table)
    return table;
  else
    throw `Invalid truth table source: '${src}'`;
}

/**
 * Make a variable table, with quick convenience.
 */
export function quickVariableTable(src:string):VariableTable<string> {
  const table = parseVariableTable(src);
  if(table)
    return table;
  else
    throw `Invalid VariableTable src: '${src}'`;
}

export function logic(str:string) {
  return parseVariableTable(str) || parseTable(str) || parseAssignment(str) || parseSentence(str);
}
