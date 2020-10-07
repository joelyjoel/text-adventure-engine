import {Grammar} from './Grammar';
/** 
 * A very limited Part of Speech tagging grammar for unit testing purposes only. */
export const ExamplePOSGrammar = Grammar.quick(`
  _adjective -> red; green; blue; fast; slow; big; small; round; square; pointy;
  _noun -> cat; dog; truck; block; fish; square; sheep
  _pluralNoun -> cats; dogs; gods; trucks; fish; squares; sheep
`);
