import {Grammar} from './Grammar';
import {NounPhraseGrammar} from './NounPhraseGrammar';
import {VerbTenseGrammar} from './VerbTenseGrammar';
import {PredicateSyntaxParse, assertIsPredicateSyntaxParse} from './parseTypings';


export const PredicateSyntaxGrammar = Grammar.quick(
  NounPhraseGrammar,
  VerbTenseGrammar,
  {
    '_prep -> of|in|at|on|under|with'/*osition*/: terminal => terminal,
    
    // preposition phrase
    '_Pp -> _prep _Object': 
      (preposition, nounPhrase) => ({preposition, nounPhrase}),

    '_Pplist -> _Pp': pp => [pp],
    '_Pplist -> _Pplist _Pp': (list, pp) => [...list, pp],
  },
  {
    '_PredicateSyntax -> _Subject _VerbTense': 
      (subjectNp, {verb, tense}):PredicateSyntaxParse => ({
        kind: 'predicateSyntax',
        verb,
        params: ['subject'],
        args: [subjectNp], 
        tense,
      }),

    '_PredicateSyntax -> _Subject _VerbTense _Object':
      (subjectNp, {verb, tense}, objectNp):PredicateSyntaxParse => ({
        kind: 'predicateSyntax',
        verb,
        params: ['subject', 'object'],
        args: [subjectNp, objectNp],
        tense,
      }),

    '_PredicateSyntax -> _Subject _VerbTense _Pplist':
      (subject, {verb, tense}, ppList):PredicateSyntaxParse => ({
        kind: 'predicateSyntax',
        verb,
        params: ['subject', ...ppList.map((pp:any) => pp.preposition)],
        args: [subject, ...ppList.map((pp:any) => pp.nounPhrase)],
        tense,
      }),

    '_PredicateSyntax -> _Subject _VerbTense _Object _Pplist':
      (subject, {verb, tense}, objectNP, ppList):PredicateSyntaxParse => ({
        kind: 'predicateSyntax',
        verb,
        params: ['subject', 'object', ...ppList.map((pp:any) => pp.preposition)],
        args: [subject, objectNP, ...ppList.map((pp:any) => pp.nounPhrase)],
        tense,
      }),
  },

  {typeAssertions: {
    _PredicateSyntax: assertIsPredicateSyntaxParse,
  }}
);
PredicateSyntaxGrammar.startingSymbol = '_PredicateSyntax';
