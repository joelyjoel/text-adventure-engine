import { parseNounPhrase } from "../parsing";
import { Dictionary } from "../Dictionary";
import { Entity, Sentence, Variable, VariableTable } from "../logic";
import { TruthTable } from "../logic/TruthTable";
import { Context } from "../Context";
import { NounPhraseParse } from "../parsing/parseNounPhrase";

export function interpretNounPhrase(nounPhrase:string, ctx:Context|Dictionary) {
  if(ctx instanceof Dictionary)
    ctx = new Context(ctx);

  const parse = parseNounPhrase(nounPhrase, ctx.dictionary);
  if(parse)
    return interpretParsedNounPhrase(parse, ctx);
  else
    return null;
}

export function interpretParsedNounPhrase(parse:NounPhraseParse, ctx:Context) {
  // Destructure the parse
  const nounPredicate = parse.noun.noun.predicate;
  const adjPredicates = parse.adjectives
    .map(adjparse => adjparse.adj.predicate);

  // Create a stand in entity variable
  const x = new Variable;

  // Create variable table to express the interpretation
  const table = new VariableTable(x);
  table.assign(new Sentence(nounPredicate, x), 'true')
  for(let predicate of adjPredicates)
    table.assign(new Sentence(predicate, x), 'true');

  return table;
}

