import { parseNounPhrase } from "../parsing";
import { Dictionary } from "../Dictionary";
import { Entity, Sentence, Variable, VariableTable } from "../logic";
import { TruthTable } from "../logic/TruthTable";
import { Context } from "../Context";
import { NounPhraseParse } from "../parsing/parseNounPhrase";
import { PredicateSyntaxParse, PredicateSyntax } from "../PredicateSyntax";

/** Interpret a string noun-phrase as an existential claim. */
export function interpretNounPhrase(nounPhrase:string, ctx:Context|Dictionary) {
  if(ctx instanceof Dictionary)
    ctx = new Context(ctx);

  const parse = parseNounPhrase(nounPhrase, ctx.dictionary);
  if(parse)
    return interpretParsedNounPhrase(parse, ctx);
  else
    return null;
}

/** Interpret a parsed noun-phrase as an existential claim. */
export function interpretParsedNounPhrase(parse:NounPhraseParse|PredicateSyntaxParse, ctx:Context) {
  if(parse.syntax instanceof PredicateSyntax) {
    throw 'Unable to interpret PredicateSyntaxParse'
  } else {
    let npParse = parse as NounPhraseParse;
    // Destructure the parse
    const nounPredicate = npParse.noun.noun.predicate;
    const adjPredicates = npParse.adjectives
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
}
