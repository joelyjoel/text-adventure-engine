import { Dictionary } from "../Dictionary";
import { Entity, Sentence, Variable, VariableTable } from "../logic";
import { TruthTable } from "../logic/TruthTable";
import { Context } from "../Context";
import { SimpleNounPhraseParse, parseNounPhrase, NounPhraseParse } from "../parsing/parseNounPhrase";
import { PredicateSyntaxParse, PredicateSyntax } from "../PredicateSyntax";
import { negativise } from "./negativise";
import { PronounParse } from "../parsing/parsePronoun";
import { ProperNounParse } from "../parsing/parseProperNoun";

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
):VariableTable {
  const {syntaxKind} = parse;

  if(syntaxKind == 'predicate_syntax') {
    return interpretPredicateSyntaxNounPhrase(
      parse as PredicateSyntaxParse<NounPhraseParse>, 
      ctx
    );

  } else if(parse.syntaxKind == 'simple_noun_phrase')
    return interpretSimpleNounPhrase(parse as SimpleNounPhraseParse, ctx);

  // else if (parse.syntaxKind == 'pronoun')
  //   return interpretPronoun(parse as PronounParse, ctx);

  else
    throw `Unexpected syntaxKind: '${parse.syntaxKind}'`
}

function interpretSimpleNounPhrase(parse:SimpleNounPhraseParse, ctx:Context) {
  // Destructure the parse
  const nounMeaning = ctx.linkingMatrix.syntaxToMeaning(parse.noun.noun)
  const adjMeanings = parse.adjectives
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
        throw `Meaningless adjective: "${parse.adjectives[i].adj.str}"`
    }

    return table;
  } else 
    throw `Meaningless noun: ${parse.noun.noun}`;
}

function interpretPredicateSyntaxNounPhrase(
  parse:PredicateSyntaxParse<NounPhraseParse>, 
  ctx:Context
) {
  // De-structure the parse object.
  const {args, syntax, tense, nounPhraseFor, str, negative} = parse

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
}

function interpretPronoun(parse:PronounParse, ctx:Context) {
  // First person singular
  if(/me|i/i.test(parse.pronoun))
    return ctx.speaker;
  
  else if(parse.pronoun == 'you')
    return ctx.listener;

  else
    throw `Unable to interpret pronoun '${parse.pronoun}'`;
}

function interpretProperNoun(parse:ProperNounParse, ctx:Context) {
  if(ctx.properNouns[parse.properNoun])
    ctx.properNouns[parse.properNoun] = new Entity;
  
  return ctx.properNouns[parse.properNoun];
}