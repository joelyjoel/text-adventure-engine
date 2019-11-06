import { parseNounPhrase } from "../parsing";
import { Dictionary } from "../Dictionary";
import { Entity, Sentence } from "../logic";
import { TruthTable } from "../logic/TruthTable";
import { Context } from "../Context";

export function interpretNounPhrase(nounPhrase:string, ctx:Context|Dictionary) {
  if(ctx instanceof Dictionary)
    ctx = new Context(ctx);

  const parse = parseNounPhrase(nounPhrase, ctx.dictionary);
  if(!parse)
    return null;

  // Destructure the parse
  const nounPredicate = parse.noun.noun.predicate;
  const adjPredicates = parse.adjectives
    .map(adjparse => adjparse.adj.predicate);

  // Create a stand in entity variable
  const X = new Entity;

  const table = new TruthTable;
  table.assign(new Sentence(nounPredicate, X), 'true')
  for(let predicate of adjPredicates)
    table.assign(new Sentence(predicate, X), 'true');

  return table;
}