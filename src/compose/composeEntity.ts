import { Entity, Predicate } from "../logic";
import { Context } from "../Context";
import { Noun } from "../Noun";
import { Adjective } from "../Adjective";
import { PredicateSyntax } from "../PredicateSyntax";
import { isTense } from "../util/tense";
import { composeNounPhrase } from "./composeNounPhrase";
import { isPredicateSyntaxWithTense } from "../linking/SyntaxLogicLinkingMatrix";

export interface composeEntityOptions {
  numberOfAdjectives: number  
  article: 'the'|'a';
  useProperNoun: boolean;
}

export function collectEntitySyntaxs(
  e:Entity, 
  ctx:Context, 
  collectSentences=true
) {
  let table = ctx.truthTable
  if(table) {
    const nouns = [], adjectives = [], sentences = [];

    for(let statement of table.involving(e)) {
      let meaning = {
        predicate:statement.sentence.predicate, 
        truth:statement.truth
      }
      for(let syntax of ctx.linkingMatrix.meaningToSyntaxs(meaning)) {
        // Handle the syntax
        if(syntax instanceof Noun)
          nouns.push(syntax.str);
        else if(syntax instanceof Adjective)
          adjectives.push(syntax.str)
        else if(isPredicateSyntaxWithTense(syntax)) {
          if(collectSentences)
            for(let nounPhraseFor in statement.sentence.args)
              if(statement.sentence.args[nounPhraseFor] == e)
                sentences.push({
                  ...syntax, 
                  args: statement.sentence.args,
                  nounPhraseFor,
                })
        } else
          throw `Unexpected syntax type: ${syntax}`;
      }
    }

    return {nouns, adjectives, sentences}
  } else
    throw `collectEntitySyntaxs expects context to have a truth table.`
}

export function composeEntity(
  e:Entity, 
  ctx:Context, 
  options:Partial<composeEntityOptions> = {}
) {
  // Possibly use a proper noun
  if(options.useProperNoun) {
    // look for a proper noun
    let properNouns = []
    for(let properNoun in ctx.properNouns)
      if(ctx.properNouns[properNoun] == e)
        properNouns.push(properNoun)

    if(properNouns.length)
      return properNouns[Math.floor(Math.random()*properNouns.length)]

    // Otherwise fall through to simple nounphrase
  }

  // Fetch all syntaxs
  let {nouns, adjectives, sentences} = collectEntitySyntaxs(e, ctx);

  // MAKE SIMPLE NOUN PHRASE:
  const {
    numberOfAdjectives = Math.floor(Math.random()*(adjectives.length+1)),
    article
  } = options

  // choose a noun
  let noun = nouns.length 
    ? nouns[Math.floor(Math.random()*nouns.length)] 
    : 'thing';

  // choose adjectives
  adjectives = adjectives
    .sort(() => Math.random()*2-1)
    .slice(0, numberOfAdjectives)

  // compose a simple noun phrase
  let nounPhrase = composeNounPhrase({
    noun, adjectives, article
  })

  return nounPhrase
}