import { Dictionary } from "../Dictionary";
import { Entity, Sentence, Variable, VariableTable, createVariable, isVariable, createEntity } from "../logic";
import { TruthTable } from "../logic/TruthTable";
import { Context } from "../Context";
import { SimpleNounPhraseParse, parseNounPhrase, NounPhraseParse } from "../parsing/parseNounPhrase";
import { PredicateSyntaxParse, PredicateSyntax } from "../PredicateSyntax";
import { negativise } from "./negativise";
import { PronounParse } from "../parsing/parsePronoun";
import { ProperNounParse } from "../parsing/parseProperNoun";
import { toCamelCase } from "../util/toCamelCase";

export interface NounPhraseInterpretation {
  /** A table of facts implied by the noun phrase */
  table?:VariableTable;
  /** Either a variable or an entity that the noun-phrase refers to. */
  returns:Entity|Variable;
};

/** 
 * Interpret a string noun-phrase as an existential claim. 
 */
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
):NounPhraseInterpretation {
  const {syntaxKind} = parse;

  if(syntaxKind == 'predicate_syntax') {
    return interpretPredicateSyntaxNounPhrase(
      parse as PredicateSyntaxParse<NounPhraseParse>, 
      ctx
    );

  } else if(parse.syntaxKind == 'simple_noun_phrase')
    return interpretSimpleNounPhrase(parse as SimpleNounPhraseParse, ctx);

  else if (parse.syntaxKind == 'pronoun')
    return interpretPronoun(parse as PronounParse, ctx);

  else if(parse.syntaxKind == 'proper_noun')
    return interpretProperNoun(parse as ProperNounParse, ctx);
  else
    throw `Unexpected syntaxKind: '${parse.syntaxKind}'`
}

function interpretSimpleNounPhrase(parse:SimpleNounPhraseParse, ctx:Context):NounPhraseInterpretation {
  // Destructure the parse
  const nounMeaning = ctx.linkingMatrix.syntaxToMeaning(parse.noun.noun)
  const adjMeanings = parse.adjectives
    .map(adjparse => ctx.linkingMatrix.syntaxToMeaning(adjparse.adj));

  if(nounMeaning) {
    // Create a stand in entity variable
    const x = createVariable();

    // Create variable table to express the interpretation
    const table = new VariableTable(x);
    table.assign({predicate: nounMeaning.predicate, args:[x]}, nounMeaning.truth)
    for(let i in adjMeanings) {
      let meaning = adjMeanings[i]
      if(meaning)
        table.assign({predicate:meaning.predicate, args:[x]}, meaning.truth);
      else
        throw `Meaningless adjective: "${parse.adjectives[i].adj.str}"`
    }

    return {table, returns:x};
  } else 
    throw `Meaningless noun: ${parse.noun.noun}`;
}

function interpretPredicateSyntaxNounPhrase(
  parse:PredicateSyntaxParse<NounPhraseParse>, 
  ctx:Context
):NounPhraseInterpretation {
  // De-structure the parse object.
  const {args, syntax, tense, nounPhraseFor, str, negative} = parse

  // Check the tense
  if(tense != 'simple_present')
    throw `Unexpected tense: ${tense} (in '${str}')`;

  const interprettedArgs = args.map(
    arg => interpretParsedNounPhrase(arg, ctx)
  )
  const argVariables = interprettedArgs.map(
    arg => arg.returns//arg.variables[0]
  )

  // Get the main variable.
  let x:Variable;
  if(typeof nounPhraseFor == 'number')
    x = argVariables[nounPhraseFor];
  else
    throw "Something bad happened";

  // Create a variable table to express the interpretation.
  const table = new VariableTable();
  if(isVariable(x))
    table.addVariable(x);

  // Merge the interpretted arguments into the table.
  for(let arg of interprettedArgs)
    if(arg.table)
      table.merge(arg.table);

  // Interpret the top level predicate in the noun phrase
  let meaning = ctx.linkingMatrix.syntaxToMeaning({syntax, tense})
  if(meaning) {
    let sentence = {predicate: meaning.predicate, args:argVariables};

    let truth = meaning.truth;

    if(negative)
      truth = negativise(truth)
    
    table.assign(sentence, truth);

    return {table, returns:x};

  } else
    throw `Syntax missing a predicate: ${syntax.symbol}`
}

function interpretPronoun(parse:PronounParse, ctx:Context):NounPhraseInterpretation {
  // First person singular
  if(/me|i/i.test(parse.pronoun))
    return {returns: ctx.speaker};
  
  else if(parse.pronoun == 'you')
    return {returns: ctx.listener};

  else
    throw `Unable to interpret pronoun '${parse.pronoun}'`;
}

function interpretProperNoun(
  parse:ProperNounParse, 
  ctx:Context
):NounPhraseInterpretation {
  // De-structure the parse.
  let {properNoun} = parse;

  // Create new entity if it does not already exist
  if(!ctx.properNouns[properNoun]) {
    //let symbol = `${Entity.getNextSymbol()}_${toCamelCase(properNoun)}`
    ctx.properNouns[properNoun] = createEntity();
  }
  
  return {returns: ctx.properNouns[properNoun]};
}
