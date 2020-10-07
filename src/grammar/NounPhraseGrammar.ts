import {Grammar} from './Grammar';

export const NounPhraseGrammar = Grammar.quick(
  '_article -> the|a|an|some|any',

  {
    '_AnyNoun -> _noun': 
      noun => ({noun, plural:false}),

    '_AnyNoun -> _pluralNoun': 
      noun => ({noun, plural:true})
  },

  {
    '_AdjList -> _adjective': adj => [adj],
    '_AdjList -> _AdjList _adjective': (list, adj) => [...list, adj],
  },

  {
    '_SimpleNounPhrase -> _article _AnyNoun': 
      (article, {noun, plural}) => ({
        article,
        adjectives: [],
        noun,
        plural,
      }),

    '_SimpleNounPhrase -> _article _AdjList _AnyNoun':
      (article, adjectives, {noun, plural}) => ({
        article,
        adjectives,
        noun,
        plural,
      }),
  },

  '_subjectPronoun -> I|you|she|he|they|it|we',
  '_objectPronoun -> me|you|it|him|her|them|us',
  '_Subject -> _SimpleNounPhrase|_subjectPronoun',
  '_Object -> _SimpleNounPhrase|_objectPronoun',
  '_NP -> _Subject|_Object',

);
