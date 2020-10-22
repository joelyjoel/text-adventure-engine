import { Dictionary } from "../Dictionary";
import { Parse } from "./Parse";
import { Noun } from "../Noun";

export interface NounParse extends Parse {
  noun: Noun;
  /**
   * Is the noun in singular form or plural. 
   * NOTE: Using a single boolean here is not great because some nouns have identical singular/plural forms. Eg: sheep, fish etc.
   * This would be fine if the function could return multiple parses, but that is not the implementation.
   * A better option would be to have two fields: `couldBePlural: boolean; couldBeSingular: boolean;`.
   */
  singular: boolean;

  /**
   * Part of speech is always noun.
   */
  pos: 'noun';

  syntaxKind: 'noun';
}

/** 
 * Identify the noun at the end of a (simple) noun phrase. 
 */
export function parseNoun(str: string, dictionary: Dictionary): NounParse|null {
  // Get the last word of the string.
  const lastWord = str.slice(str.lastIndexOf(' ')+1);

  // List all nouns and phrasal nouns from the dictionary that end with the last word
  const possibleNouns = dictionary.nounIndex[lastWord];

  let noun;
  if(!possibleNouns)
    // Exit if no matches
    return null;
  else
    // Choose the first match that fits.
    // BUG: Although resolving a single noun is quite a reasonable way to reduce complexity, this implementation could ignore phrasal nouns at random. It will choose whichever it finds first.
    noun = possibleNouns.find(n => str.slice(-n.str.length) == n.str);
  

  // Exit with null if no noun found
  if(!noun)
    return null;
  
  // Otherwise
  return {
    noun,
    syntaxKind: 'noun',
    singular: true,
    pos: 'noun',
    from: str.length-noun.str.length,
    to: str.length,
    str
  };
}
