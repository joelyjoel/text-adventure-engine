import {Grammar} from './Grammar';
/** 
 * A very limited Part of Speech tagging grammar for unit testing purposes only. */
export const ExamplePOSGrammar = Grammar.quick(`
  _adjective -> red; green; blue; fast; slow; big; small; round; square; pointy;
  _noun -> cat; dog; truck; block; fish; square; sheep
  _pluralNoun -> cats; dogs; gods; trucks; fish; squares; sheep


  _infinitive -> dance ; skate ; chase
  _gerund -> appreciating ; dancing ; skating ; chasing
  _firstPersonSingular -> dance ; skate ; chase
  _secondPersonSingular -> dance ; skate ; chase;
  _thirdPersonSingular -> dances; skates; chases;
  _firstPersonPlural -> dance; skate; chase;
  _secondPersonPlural -> dance; skate; chase
  _thirdPersonPlural -> dance; skate; chase; 
  _pastParticiple -> danced ; skated; chased;
  _pastTense -> danced ; skated ; chased;
`);

// _pastParticiple, _firstPersonSingular, _secondPersonSingular, _thirdPersonSingular, _firstPersonPlural, _secondPersonPlural, _thirdPersonPlural
