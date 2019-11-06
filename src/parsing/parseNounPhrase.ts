import { Dictionary } from "../Dictionary";
import { parseNoun, NounParse } from "./parseNoun";
import { Parse } from "./Parse";
import { parseIdentifier, IdentifierParse } from "./parseIdentifier";
import { parseAdjectives, AdjectiveParse } from "./parseAdjectives";

interface NounPhraseParse extends Parse {
  pos: 'nounphrase';
  identifier: IdentifierParse;
  noun: NounParse;
  adjectives: AdjectiveParse[];
}

export function parseNounPhrase(str:string, dict:Dictionary):NounPhraseParse|null {
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
          identifier: identifier,
          adjectives,
          noun: noun,
          pos: 'nounphrase',
          from: 0,
          to: str.length,
          str
        }
    }

    // Otherwise,
    return null;
  } else
    return null; 
}