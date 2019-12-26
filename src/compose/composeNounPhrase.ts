import { properNounRegex } from "../parsing/parseProperNoun";
import { toPlural } from '../util/plural'
import { Template } from "../Template";
import { toPossessiveAdjective } from "../util";

type NounPhraseComposable = {
  definite?: boolean;
  indefinite?: boolean;
  possessor?: string;
  article?: string;
  adjectives?: string[];
  noun?: string;
  plural?: boolean;

  // OR
  properNoun?: string;
}

export function composeNounPhrase(args:NounPhraseComposable) {
  // If a proper noun just return the proper noun.
  if(args.properNoun) {
    if(!properNounRegex.test(args.properNoun))
      throw `Proper noun is not valid: ${args.properNoun}`
    return args.properNoun;
  } else if(args.noun) {
    // De-structure args
    let {noun, adjectives=[], plural=false, possessor} = args;

    // Choose the article.
    let article
    if(args.article)
      article = args.article;
    else if(possessor) {
      article = toPossessiveAdjective(possessor)
    } else if(args.definite === true)
      article = 'the';
    else if(args.definite === false)
      article = 'a';
    else if(args.indefinite === true)
      article = 'a';
    else if(args.indefinite === false)
      article = 'the';
    else
      article = 'the';

    // Pluralise noun
    if(plural)
      noun = toPlural(noun);

    /** Adjectives and noun concatenated */
    let adjsnoun = [...adjectives, noun].join(' ');
    
    if(article == 'a' && plural)
      article = 'some';

    // Conjugate indefinite article
    if(article == 'a' && /^[aeiouh]/i.test(adjsnoun))
      article = 'an';

    return `${article} ${adjsnoun}`;
  }
}