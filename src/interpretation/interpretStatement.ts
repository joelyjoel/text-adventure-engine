import { StatementParse, parseStatement } from "../parsing/parseStatement";
import { Context } from "../Context";
import { interpretParsedNounPhrase } from "./interpretNounPhrase";
import { TruthTable } from "../logic/TruthTable";
import { Sentence, Entity, VariableTable, Predicate } from "../logic";
import { Template } from "../Template";
import { PredicateSyntax } from "../PredicateSyntax";

export function interpretParsedStatement(parse:StatementParse, ctx:Context) {
  if(parse.question)
    throw "Cannot interpet a question as a statement."

  let syntax = parse.syntax;

  let meaning
  if(syntax instanceof PredicateSyntax) {
    meaning = ctx.linkingMatrix.syntaxToMeaning({
      syntax: syntax, tense: parse.tense,
    })
  } else
    throw `Unable to interpret syntax: ${syntax}`


  if(!meaning)
    throw "Can't interpret a statement without associated predicate."

  const table = new VariableTable;
  const args = parse.args.map(arg => {
    if(typeof arg == 'object' && (arg.pos == 'NP' || arg.pos == 'proper_noun' || arg.pos == 'pronoun')) {
      let interpretation = interpretParsedNounPhrase(arg, ctx);
      let argTable = interpretation.table
      if(argTable)
        table.merge(argTable);
      return interpretation.returns;
    } else {
      console.log('## arg:', arg)
      throw 'Can only interpret statements with noun phrase arguments';
    }
  });
    

  let sentence = new Sentence(meaning.predicate, ...args);
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