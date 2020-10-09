import {Grammar} from './Grammar';
import {NounPhraseGrammar} from './NounPhraseGrammar';
import {VerbTenseGrammar} from './VerbTenseGrammar';


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
      (subjectNp, {verb, tense}) => ({
        verb,
        params: ['subject'],
        args: [subjectNp], 
        tense,
      }),

    '_PredicateSyntax -> _Subject _VerbTense _Object':
      (subjectNp, {verb, tense}, objectNp) => ({
        verb,
        params: ['subject', 'object'],
        args: [subjectNp, objectNp],
        tense,
      }),

    '_PredicateSyntax -> _Subject _VerbTense _Pplist':
      (subject, {verb, tense}, ppList) => ({
        verb,
        params: ['subject', ...ppList.map((pp:any) => pp.preposition)],
        args: [subject, ...ppList.map((pp:any) => pp.nounPhrase)],
        tense,
      }),

    '_PredicateSyntax -> _Subject _VerbTense _Object _Pplist':
      (subject, {verb, tense}, objectNP, ppList) => ({
        verb,
        params: ['subject', 'object', ...ppList.map((pp:any) => pp.preposition)],
        args: [subject, objectNP, ...ppList.map((pp:any) => pp.nounPhrase)],
        tense,
      }),
  }
);
PredicateSyntaxGrammar.startingSymbol = '_PredicateSyntax';
