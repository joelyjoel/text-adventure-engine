import {Grammar} from './Grammar';
import {MorphologyRelation} from '../morphology';

export const VerbTenseGrammar = Grammar.quick(
  {
    '_conjugatedVerb -> _firstPersonSingular':
      ({base}:MorphologyRelation) => ({verb:base, person:1, plural:false}),

    '_conjugatedVerb -> _secondPersonSingular':
      ({base}:MorphologyRelation) => ({verb:base, person:2, plural:false}),

    '_conjugatedVerb -> _thirdPersonSingular':
      ({base}:MorphologyRelation) => ({verb:base, person:3, plural:false}),

    '_conjugatedVerb -> _firstPersonPlural':
      ({base}:MorphologyRelation) => ({verb:base, person:1, plural:true}),

    '_conjugatedVerb -> _secondPersonPlural':
      ({base}:MorphologyRelation) => ({verb:base, person:2, plural: true}),

    '_conjugatedVerb -> _thirdPersonPlural':
      ({base}:MorphologyRelation) => ({verb:base, person:3, plural: true}),

    '_SimplePresent -> _conjugatedVerb': 
      ({verb}) => ({verb, tense:'simplePresent'}),

    '_PresentContinuous -> _be _gerund': 
      (be, {base}:MorphologyRelation) => ({verb:base, tense:'_presentContinuous'}),

    '_SimplePast -> _pastTense': 
      (verb:MorphologyRelation) => ({verb: verb.base, tense:'simplePast'}),

    '_PastContinuous -> _were _gerund': 
      (were, verb:MorphologyRelation) => ({verb: verb.base, tense: 'pastContinous'}),

    '_PresentPerfect -> _have _pastParticiple': 
      (have, verb:MorphologyRelation) => ({verb: verb.base, tense:'presentPerfect'}),

    '_PresentPerfectContinuous -> _have been _gerund': 
      (have, verb:MorphologyRelation) => ({verb:verb.base, tense: 'presentPerfectContinuous'}),

    '_PastPerfect -> had _pastParticiple':
      (verb: MorphologyRelation) => ({verb: verb.base, tense: 'pastPerfect'}),

    '_PastPerfectContinuous -> had been _gerund':
      (verb: MorphologyRelation) => ({verb: verb.base, tense:'pastPerfectContinous'}),

    '_FuturePerfect -> will have _pastParticiple':
      (verb: MorphologyRelation) => ({verb: verb.base, tense:'futurePerfect'}),

    '_FuturePerfectContinuous -> will have been _gerund':
      (verb: MorphologyRelation) => ({verb: verb.base, tense:'futurePerfectContinuous'}),

    '_SimpleFuture -> will _infinitive':
      (verb: string) => ({verb: verb, tense:'simpleFuture'}),

    '_FutureContinuous -> will be _gerund':
      (verb: MorphologyRelation) => ({verb: verb.base, tense: 'futureContinuous'}),

    '_VerbTense -> _SimplePresent | _PresentContinuous | _SimplePast | _SimplePast | _PastContinuous  | _PresentPerfect | _PresentPerfectContinuous | _PastPerfect | _PastPerfectContinuous | _FuturePerfect | _FuturePerfectContinuous | _SimpleFuture | _FutureContinuous':
      verbTense => verbTense,
  },

  // Essential irregular verbs
  `
    _be -> am|are|is
    _were -> were|was
    _have -> have | has
  `,
);

