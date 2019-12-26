import { Dictionary } from "../Dictionary";
import { parseNoun, NounParse } from "./parseNoun";
import { Parse } from "./Parse";
import { parseIdentifier, IdentifierParse } from "./parseIdentifier";
import { parseAdjectives, AdjectiveParse } from "./parseAdjectives";
import { PredicateSyntaxParse } from "../PredicateSyntax";


// # # # # # TYPES

export type NounPhraseParse = (SimpleNounPhraseParse|PredicateSyntaxParse<any>);

export interface SimpleNounPhraseParse extends Parse {
  syntaxKind: 'simple_noun_phrase';
  pos: 'NP';
  identifier: IdentifierParse;
  noun: NounParse;
  adjectives: AdjectiveParse[];
  syntax:null,
}

// ##################

export function parseNounPhrase(
  str:string, 
  dict:Dictionary
):(NounPhraseParse|null) {
  let complexParse = parseComplexNounPhrase(str, dict);
  if(complexParse)
    return complexParse;
  
  // Otherwise,
  let simpleParse = parseSimpleNounPhrase(str, dict);
  if(simpleParse)
    return simpleParse;

  // Otherwise,
  return null;
}

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

/** Parse a noun phrase using predicate syntaxs. Eg/ "the moose which is aloose" */
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