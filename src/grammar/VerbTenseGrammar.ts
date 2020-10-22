import {Grammar} from './Grammar';
import {MorphologyRelation} from '../morphology';
import {VerbTenseParse, assertIsVerbTenseParse} from './parseTypings';

export const VerbTenseGrammar = Grammar.quick(
  {
    '_SimplePresent -> _conjugatedVerb': 
      ({base}):VerbTenseParse => ({kind: 'verbTense', verb:base, tense:'simplePresent'}),

    '_PresentContinuous -> _be _gerund': 
      (be, {base}:MorphologyRelation):VerbTenseParse => ({kind: 'verbTense', verb:base, tense:'presentContinuous'}),

    '_SimplePast -> _pastTense': 
      (verb:MorphologyRelation):VerbTenseParse => ({kind: 'verbTense', verb: verb.base, tense:'simplePast'}),

    '_PastContinuous -> _were _gerund': 
      (were, verb:MorphologyRelation):VerbTenseParse => ({kind: 'verbTense', verb: verb.base, tense: 'pastContinuous'}),

    '_PresentPerfect -> _have _pastParticiple': 
      (have, verb:MorphologyRelation):VerbTenseParse => ({kind: 'verbTense', verb: verb.base, tense:'presentPerfect'}),

    '_PresentPerfectContinuous -> _have been _gerund': 
      (have, verb:MorphologyRelation):VerbTenseParse => ({kind: 'verbTense', verb:verb.base, tense: 'presentPerfectContinuous'}),

    '_PastPerfect -> had _pastParticiple':
      (verb: MorphologyRelation):VerbTenseParse => ({kind: 'verbTense', verb: verb.base, tense: 'pastPerfect'}),

    '_PastPerfectContinuous -> had been _gerund':
      (verb: MorphologyRelation):VerbTenseParse => ({kind: 'verbTense', verb: verb.base, tense:'pastPerfectContinuous'}),

    '_FuturePerfect -> will have _pastParticiple':
      (verb: MorphologyRelation):VerbTenseParse => ({kind: 'verbTense', verb: verb.base, tense:'futurePerfect'}),

    '_FuturePerfectContinuous -> will have been _gerund':
      (verb: MorphologyRelation):VerbTenseParse => ({kind: 'verbTense', verb: verb.base, tense:'futurePerfectContinuous'}),

    '_SimpleFuture -> will _infinitive':
      (verb: string):VerbTenseParse => ({kind: 'verbTense', verb: verb, tense:'simpleFuture'}),

    '_FutureContinuous -> will be _gerund':
      (verb: MorphologyRelation):VerbTenseParse => ({kind: 'verbTense', verb: verb.base, tense: 'futureContinuous'}),

    '_VerbTense -> _SimplePresent | _PresentContinuous | _SimplePast | _PastContinuous  | _PresentPerfect | _PresentPerfectContinuous | _PastPerfect | _PastPerfectContinuous | _FuturePerfect | _FuturePerfectContinuous | _SimpleFuture | _FutureContinuous':
      verbTense => verbTense,
  },

  // Essential irregular verbs
  `
    _be -> am|are|is
    _were -> were|was
    _have -> have | has
  `,
  {typeAssertions: {
    _VerbTense: assertIsVerbTenseParse,
    _SimplePresent: assertIsVerbTenseParse,
    _PresentContinuous: assertIsVerbTenseParse,
    _SimplePast: assertIsVerbTenseParse,
    _PastContinuous: assertIsVerbTenseParse,
    _PresentPerfect: assertIsVerbTenseParse,
    _PresentPerfectContinuous: assertIsVerbTenseParse,
    _PastPerfect: assertIsVerbTenseParse,
    _SimpleFuture: assertIsVerbTenseParse,
    _PastPerfectContinuous: assertIsVerbTenseParse,
    _FuturePerfect: assertIsVerbTenseParse,
    _FuturePerfectContinuous: assertIsVerbTenseParse,
    _FutureContinuous: assertIsVerbTenseParse,
  }},
);

