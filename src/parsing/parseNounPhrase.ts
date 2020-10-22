import { Dictionary } from "../Dictionary";
import { parseNoun, NounParse } from "./parseNoun";
import { Parse } from "./Parse";
import { parseIdentifier, IdentifierParse } from "./parseIdentifier";
import { parseAdjectives, AdjectiveParse } from "./parseAdjectives";
import { PredicateSyntaxParse } from "../PredicateSyntax";
import { parseProperNoun, ProperNounParse } from "./parseProperNoun";
import { parsePronoun, PronounParse } from "./parsePronoun";


// # # # # # TYPES

export type NounPhraseParse = (SimpleNounPhraseParse|PredicateSyntaxParse<any>|ProperNounParse|PronounParse);

/**
 * A parse of a 'simple' noun phrase. This is a noun phrase in the form of article + adjectives + noun.
 */
export interface SimpleNounPhraseParse extends Parse {
  syntaxKind: 'simple_noun_phrase';

  /**
   * Part of speech, as opposed to `syntaxKind` this field represents the funcitional role of the phrase in a sentence rather than its internal structure. For noun-phrase parses, this is always 'NP'.
   */
  pos: 'NP';

  /**
   * Details about the identifier in the noun phrase. This is usually an article (the cat), but it could be a possessive adjective (my cat, Henrietta's cat) or a number (2 cats).
   */
  identifier: IdentifierParse;

  /**
   * Parse of the noun part of the phrase.
   */
  noun: NounParse;

  /**
   * Parses of the adjectives in the phrase/
   */
  adjectives: AdjectiveParse[];

  /**
   * Syntax field is always blank, for other `Parse` sub-interfaces this would link to the specific Syntax object used to parse the string.
   */
  syntax:null,
}


/**
 * Parse a noun-phrase using the given dictionary.
 *
 * NOTE: A problem with this function (vs Grammar.parse) is that it has no allowance for ambiguity. Admittedly, this is limited in noun-phrases, but not impossible as with multiple overlapping phrasal adjectives.
 */
export function parseNounPhrase(
  str:string, 
  dict:Dictionary
):(NounPhraseParse|null) {
  // Parse as a proper noun.
  let properNounParse = parseProperNoun(str);
  if(properNounParse)
    return properNounParse;

  // Parse as pronoun
  let pronounParse = parsePronoun(str);
  if(pronounParse)
    return pronounParse;

  // Parse as complex (PredicateSyntax) noun-phrase
  let complexParse = parseComplexNounPhrase(str, dict);
  if(complexParse)
    return complexParse;
  
  // Otherwise, parse as simple noun phrase.
  let simpleParse = parseSimpleNounPhrase(str, dict);
  if(simpleParse)
    return simpleParse;

  // Otherwise, the parse fails.
  return null;
}

/**
 * Parse a string as a simple-noun-phrase, i.e. in the form: identifier + adjectives + noun.
 */
export function parseSimpleNounPhrase(
  str:string, 
  dict:Dictionary
):(SimpleNounPhraseParse|null) {

  // First get the noun
  let noun = parseNoun(str, dict);
  if(noun) {
    let preNoun = str.slice(0, noun.from).trim();
    let identifier = parseIdentifier(preNoun);
    if(identifier) {
      const middlePart = str.slice(identifier.to, noun.from).trim();
      const adjectives = parseAdjectives(middlePart, dict);
      if(adjectives)
        return {
          syntaxKind: 'simple_noun_phrase',
          identifier: identifier,
          adjectives,
          noun: noun,
          pos: 'NP',
          from: 0,
          to: str.length,
          str,
          syntax: null,
        }
    }

    // Otherwise,
    return null;
  } else
    return null; 
}

/** 
 * Parse a noun phrase using predicate syntaxs. I.e. one that has 'which'-preposition phrases attached.  * Eg/ "the moose which is aloose" 
 *
 * This is done by iterating through every PredicateSyntax in the dictionary.
 */
export function parseComplexNounPhrase(
  str:string, 
  dict:Dictionary
):PredicateSyntaxParse<NounPhraseParse>|null {
  // Automatically fail if it doesn't include 'which'.
  if(!/which/.test(str))
    return null;

  // Try predicate syntaxs
  for(let syntax of dict.predicateSyntaxs) {
    let parses = syntax.parse(str, {
      asStatement: false,
      asNounPhrase: true,
      asQuestion: false,
      asNegative: true,
    })

    for(let parse of parses) {
      // Recursively parse args.
      let args = parse.args
      const parsedArgs = args.map((arg, i) => {
        if(syntax.params[i].entity) {
          return parseSimpleNounPhrase(arg, dict)
        } else
          return arg;
      })

      return {
        ...parse,
        args: parsedArgs,
        //pos: 'NP',
      } as PredicateSyntaxParse<NounPhraseParse>;
    }
  }
  
  // Otherwise,
  return null;
}
