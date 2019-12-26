import { StatementParse, parseStatement } from "../parsing/parseStatement";
import { Context } from "../Context";
import { interpretParsedNounPhrase } from "./interpretNounPhrase";
import { TruthTable } from "../logic/TruthTable";
import { Sentence, Entity, VariableTable } from "../logic";

export function interpretParsedStatement(parse:StatementParse, ctx:Context) {
  if(parse.question)
    throw "Cannot interpet a question as a statement."

  const predicate = parse.syntax.predicate;
  if(!predicate)
    throw "Can't interpret a statement without associated predicate."

  const table = new VariableTable;
  const args = parse.args.map(arg => {
    if(typeof arg == 'object' && arg.pos == 'NP') {
      let interpretation = interpretParsedNounPhrase(arg, ctx);
      table.merge(interpretation);
      return interpretation.variables[0];
    } else {
      console.log('## arg:', arg)
      throw 'Can only interpret statements with noun phrase arguments';
    }
  });
    

  let sentence = new Sentence(predicate, ...args);
  if(parse.tense == 'simple_present') {
    if(parse.negative)
      table.assign(sentence, 'F');
    else
      table.assign(sentence, 'T');
  } else
    throw `Unable to interpret sentence with tense: ${parse.tense}`

  return table;
}

export function interpretStatement(str:string, ctx:Context) {
  // Get the first parse of the statement
  let [parse] = parseStatement(str, ctx);
  if(parse)
    return interpretParsedStatement(parse, ctx);
  else
    return null;
}