import {Grammar} from './Grammar';

export const VerbTenseGrammar = Grammar.quick(
  {
    '_SimplePresent -> _conjugatedVerb': 
      verb => ({verb, tense:'simplePresent'}),

    '_PresentContinuous -> _be _gerund': 
      (be, verb) => ({verb, tense:'_presentContinuous'}),

    '_SimplePast -> pastTense': 
      verb => ({verb, tense:'simplePast'}),

    '_PastContinuous -> _were _gerund': 
      (were, verb) => ({verb, tense: 'pastContinous'}),

    '_PresentPerfect -> _have _pastParticiple': 
      (have, verb) => ({verb, tense:'presentPerfect'}),

    '_PresentPerfectContinuous -> _have been _gerund': 
      (have, verb) => ({verb, tense: 'presentPerfectContinuous'}),

    '_PastPerfect -> had _pastParticiple':
      verb => ({verb, tense: 'pastPerfect'}),

    '_PastPerfectContinuous -> had been _gerund':
      verb => ({verb, tense:'pastPerfectContinous'}),

    '_FuturePerfect -> will have _pastParticiple':
      verb => ({verb, tense:'futurePerfect'}),

    '_FuturePerfectContinuous -> will have been _gerund':
      verb => ({verb, tense:'futurePerfectContinuous'}),

    '_SimpleFuture -> will _infinitive':
      verb => ({verb, tense:'simpleFuture'}),

    '_FutureContinuous -> will be _gerund':
      verb => ({verb, tense: 'futureContinuous'}),

    '_verbTense -> _SimplePresent | _PresentContinuous | _SimplePast | _SimplePast | _PastContinuous  | _PresentPerfect | _PresentPerfectContinuous | _PastPerfect | _PastPerfectContinuous | _FuturePerfect | _FuturePerfectContinuous | _SimpleFuture | _FutureContinuous':
      verbTense => verbTense,
  },

  // Essentual irregular verbs
  `
    _be -> am|are|is
    _were -> were|was
    _have -> have | has
  `,
);

