import { Dictionary } from "../Dictionary";
import { Entity, Sentence, Variable, VariableTable } from "../logic";
import { TruthTable } from "../logic/TruthTable";
import { Context } from "../Context";
import { SimpleNounPhraseParse, parseNounPhrase, NounPhraseParse } from "../parsing/parseNounPhrase";
import { PredicateSyntaxParse, PredicateSyntax } from "../PredicateSyntax";
import { negativise } from "./negativise";

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
    let meaning = ctx.linkingMatrix.syntaxToMeaning({syntax, tense})
    if(meaning) {
      let sentence = new Sentence(meaning.predicate, ...argVariables)

      let truth = meaning.truth;

      if(negative)
        truth = negativise(truth)
      
      table.assign(sentence, truth);

      return table;

    } else
      throw `Syntax missing a predicate: ${syntax.symbol}`

  } else if(parse.syntaxKind == 'simple_noun_phrase') {
    let npParse = parse as SimpleNounPhraseParse;
    // Destructure the parse
    const nounMeaning = ctx.linkingMatrix.syntaxToMeaning(npParse.noun.noun)//npParse.noun.noun.predicate;
    const adjMeanings = npParse.adjectives
      .map(adjparse => ctx.linkingMatrix.syntaxToMeaning(adjparse.adj));

    if(nounMeaning) {
      // Create a stand in entity variable
      const x = new Variable;

      // Create variable table to express the interpretation
      const table = new VariableTable(x);
      table.assign(new Sentence(nounMeaning.predicate, x), nounMeaning.truth)
      for(let i in adjMeanings) {
        let meaning = adjMeanings[i]
        if(meaning)
          table.assign(new Sentence(meaning.predicate, x), meaning.truth);
        else
          throw `Meaningless adjective: "${npParse.adjectives[i].adj.str}"`
      }

      return table;
    } else 
      throw `Meaningless noun: ${npParse.noun.noun}`;
  } else
    throw `Unexpected syntaxKind: '${parse.syntaxKind}'`
}
