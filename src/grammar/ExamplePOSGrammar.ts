import {Grammar} from './Grammar';
import {MorphologyRelation} from '../morphology';
/** 
 * A very limited Part of Speech tagging grammar for unit testing purposes only. */
export const ExamplePOSGrammar = Grammar.quick(
  `
  _adjective -> red; green; blue; fast; slow; big; small; round; square; pointy;
  _noun -> cat; dog; truck; block; fish; square; sheep
  _pluralNoun -> cats; dogs; gods; trucks; fish; squares; sheep


  _infinitive -> dance ; skate ; chase
  `,
  {
    // Mocking up wordnet/morphology/deconjugation
    '_conjugatedVerb -> dance ; skate ; chase':
      (terminal:string):MorphologyRelation => ({form:'conjugatedVerb', base:terminal, baseForm:'infinitive'}),
    '_gerund -> appreciating ; dancing ; skating ; chasing':
      (terminal:string):MorphologyRelation => ({form:'gerund', base:terminal, baseForm:'infinitive'}),
  }
);

// _pastParticiple, _firstPersonSingular, _secondPersonSingular, _thirdPersonSingular, _firstPersonPlural, _secondPersonPlural, _thirdPersonPlural
