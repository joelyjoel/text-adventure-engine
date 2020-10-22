import {Grammar} from './Grammar';
import {assertIsSimpleNounPhraseParse, assertIsAdjectiveParse, assertIsArticleParse, assertIsNounParse, SimpleNounPhraseParse, PronounParse, assertIsPronounParse, assertIsNounPhraseParse} from './parseTypings';

export const NounPhraseGrammar = Grammar.quick(
  '_article -> the|a|an|some|any',

  {
    '_AnyNoun -> _noun': 
      (noun:string) => ({
        noun, 
        couldBeSingular:true,
        couldBePlural: false,
      }),

    '_AnyNoun -> _pluralNoun': 
      noun => ({
        noun, 
        couldBePlural:true,
        couldBeSingular: false,
      })
  },

  {
    '_AdjList -> _adjective': adj => [adj],
    '_AdjList -> _AdjList _adjective': (list, adj) => [...list, adj],
  },

  {
    '_SimpleNounPhrase -> _article _AnyNoun': 
      (article, {noun, couldBePlural, couldBeSingular}):SimpleNounPhraseParse => ({
        kind:'simpleNounPhrase',
        article,
        adjectives: [],
        noun,
        couldBePlural,
        couldBeSingular,
      }),

    '_SimpleNounPhrase -> _article _AdjList _AnyNoun':
      (article, adjectives, {noun, couldBeSingular, couldBePlural}):SimpleNounPhraseParse => ({
        kind:'simpleNounPhrase',
        article,
        adjectives,
        noun,
        couldBePlural,
        couldBeSingular,
      }),
  },

  {
    '_subjectPronoun -> I|you|she|he|they|it|we':
      (pronoun):PronounParse => ({
        kind:'pronoun', 
        pronoun, 
        couldBeSubject:true, 
        couldBeObject:false,
        couldBeSingular: pronoun != 'we', // any but 'we' can be singular
        couldBePlural: /you|they|we/.test(pronoun),
      }),

    '_objectPronoun -> me|you|it|him|her|them|us':
      (pronoun):PronounParse => ({
        kind:'pronoun',
        pronoun, 
        couldBeSubject:false, 
        couldBeObject:true,
        couldBeSingular: pronoun != 'us', // Any but 'us' can be singular
        couldBePlural: /you|them|us/.test(pronoun),
      }),
  },
  '_Subject -> _SimpleNounPhrase|_subjectPronoun',
  '_Object -> _SimpleNounPhrase|_objectPronoun',
  '_NP -> _Subject|_Object',

  {typeAssertions: {
    _SimpleNounPhrase: assertIsSimpleNounPhraseParse,
    _adjective: assertIsAdjectiveParse,
    _noun: assertIsNounParse,
    _article: assertIsArticleParse,
    _subjectPronoun: assertIsPronounParse,
    _objectPronoun: assertIsPronounParse,
    _Subject: assertIsNounPhraseParse,
    _Object: assertIsNounPhraseParse,
  }}
);
