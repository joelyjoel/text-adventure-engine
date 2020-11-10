import {TruthTable} from './TruthTable';
import {VariableTable} from './VariableTable';
import {AdditionTable} from './AdditionTable';
import {parseAssignment, parseArgs, parseSentence} from './parse';

export function parseTable(str:string) {
  if(str[0] != '{' || str[str.length-1] != '}')
    return null;


  const lines = str.slice(1, -1).split(/[\&\n]/)
    .map(nosehair => nosehair.trim())
    .filter(line => line.length)

  
  const assignments = lines.map(line => parseAssignment(line));
  
  const table = new TruthTable<string>();
  for(let line of lines) {
    let assignment = parseAssignment(line);
    if(assignment) {
      table.assign(assignment.sentence, assignment.truth);
      continue;
    }

    let sentence = parseSentence(line);
    if(sentence) {
      table.assign(sentence, 'T')
      continue;
    }

    // Otherwise,
    return null;
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

export function quickAdditionTable(parent:TruthTable|string, addition:TruthTable|string) {
  return new AdditionTable(
    typeof parent == 'string' ? quickTruthTable(parent) : parent,
    typeof addition == 'string' ? quickTruthTable(addition) : addition
  );
}

