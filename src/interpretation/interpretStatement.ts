import { StatementParse, parseStatement } from "../parsing/parseStatement";
import { Context } from "../Context";
import { interpretParsedNounPhrase } from "./interpretNounPhrase";
import { TruthTable } from "../logic/TruthTable";
import { Sentence, Entity, VariableTable } from "../logic";

export function interpretParsedStatement(parse:StatementParse, ctx:Context) {
  const predicate = parse.syntax.predicate;
  if(!predicate)
    throw "Can't interpret a statement without associated predicate."

  const table = new VariableTable;
  const args = parse.args.map(arg => {
    if(typeof arg == 'object' && arg.pos == 'nounphrase') {
      let interpretation = interpretParsedNounPhrase(arg, ctx);
      table.merge(interpretation);
      return interpretation.variables[0];
    } else
      throw 'Can only interpret statements with entity arguments';
  });

  console.log('##', args)
    

  let sentence = new Sentence(predicate, ...args);
  table.assign(sentence, 'true');

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