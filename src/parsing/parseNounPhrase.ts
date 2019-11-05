import { Dictionary } from "../Dictionary";
import { parseNoun, NounParse } from "./parseNoun";
import { Parse } from "./Parse";
import { parseIdentifier, IdentifierParse } from "./parseIdentifier";

interface NounPhraseParse extends Parse {
  pos: 'nounphrase';
  identifier: IdentifierParse;
  noun: NounParse;
}

export function parseNounPhrase(str:string, dict:Dictionary):NounPhraseParse|null {
  // First get the noun
  let noun = parseNoun(str, dict);
  if(noun) {
    let preNoun = str.slice(0, noun.from).trim();
    let identifier = parseIdentifier(preNoun);
    if(identifier) {
      let middlePart = str.slice(identifier.to, noun.from).trim();
      if(middlePart.length == 0)
        return {
          identifier: identifier,
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