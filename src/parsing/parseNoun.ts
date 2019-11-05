import { Dictionary } from "../Dictionary";
import { Parse } from "./Parse";
import { Noun } from "../Noun";

export interface NounParse extends Parse {
  noun: Noun;
  singular: boolean;
  pos: 'noun';
}

/** Identify the noun at the end of a noun phrase. */
export function parseNoun(str: string, dictionary: Dictionary): NounParse|null {
  const lastWord = str.slice(str.lastIndexOf(' ')+1);
  const possibleNouns = dictionary.nounIndex[lastWord];

  console.log("## Last word:", lastWord)
  console.log("## Possible nouns:", possibleNouns)

  let noun;
  if(!possibleNouns)
    return null;
  else if(possibleNouns.length == 1)
    noun = possibleNouns[0];
  else {
    noun = possibleNouns.find(n => str.slice(-n.str.length) == n.str);
  }

  // Exit with null if no noun found
  if(!noun)
    return null;
  
  // Otherwise
  return {
    noun,
    singular: true,
    pos: 'noun',
    from: str.length-noun.str.length,
    to: str.length,
    str
  };
}