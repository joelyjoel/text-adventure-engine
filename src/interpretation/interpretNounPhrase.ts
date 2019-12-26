import { Dictionary } from "../Dictionary";
import { Entity, Sentence, Variable, VariableTable } from "../logic";
import { TruthTable } from "../logic/TruthTable";
import { Context } from "../Context";
import { SimpleNounPhraseParse, parseNounPhrase, NounPhraseParse } from "../parsing/parseNounPhrase";
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
export function interpretParsedNounPhrase(
  parse:NounPhraseParse, 
  ctx:Context
) {
  const {syntaxKind} = parse;

  if(syntaxKind == 'predicate_syntax') {
    // Complex noun phrase.
    const {
      args,
      syntax,
      tense,
      nounPhraseFor,
      str,
      negative,
    } = parse as PredicateSyntaxParse<NounPhraseParse>

    // Check the tense
    if(tense != 'simple_present')
      throw `Unexpected tense: ${tense} (in '${str}')`;

    const interprettedArgs = args.map(
      arg => interpretParsedNounPhrase(arg, ctx)
    )
    const argVariables = interprettedArgs.map(
      table => table.variables[0]
    )
    
    // Get the main variable.
    let x:Variable;
    if(typeof nounPhraseFor == 'number')
      x = interprettedArgs[nounPhraseFor].variables[0];
    else
      throw "Something bad happened";

    // Create a variable table to express the interpretation.
    const table = new VariableTable(x);

    // Merge the interpretted arguments into the table.
    for(let subTable of interprettedArgs)
      table.merge(subTable);

    // Interpret the top level predicate in the noun phrase
    let P = syntax.predicate;
    if(P) {
      let sentence = new Sentence(P, ...argVariables)

      let truth = negative == false ? 'T' : 'F';
      
      table.assign(sentence, truth);

      return table;

    } else
      throw `Syntax missing a predicate: ${syntax.name}`

  } else if(parse.syntaxKind == 'simple_noun_phrase') {
    let npParse = parse as SimpleNounPhraseParse;
    // Destructure the parse
    const nounPredicate = npParse.noun.noun.predicate;
    const adjPredicates = npParse.adjectives
      .map(adjparse => adjparse.adj.predicate);

    // Create a stand in entity variable
    const x = new Variable;

    // Create variable table to express the interpretation
    const table = new VariableTable(x);
    table.assign(new Sentence(nounPredicate, x), 'T')
    for(let predicate of adjPredicates)
      table.assign(new Sentence(predicate, x), 'T');

    return table;
  } else
    throw `Unexpected syntaxKind: '${parse.syntaxKind}'`
}
