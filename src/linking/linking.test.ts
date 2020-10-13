import {createAdjectivePredicate, createNounPredicate, createPredicateSyntaxPredicate} from './linking';
import {isPredicate} from '../logic';

describe('Adjective predicates', () => {
  test.each([
    ['shiny', 'IsShiny/1'],
    ['matte', 'IsMatte/1'],
    ['super cool', 'IsSuperCool/1'],
  ])('createAdjectivePredicate("%s") = %s', (adj, P) => {
    expect(createAdjectivePredicate(adj)).toBe(P);
  });

  describe('createAdjectivePredicate() produces valid predicates', () => {
    const adjectives = ['red', 'green', 'blue', 'light brown'];
    const predicates = adjectives.map(adj => createAdjectivePredicate(adj));

    test.each(predicates)('%s is a valid predicate', P => {
      expect(isPredicate(P)).toBe(true);
    });
  });

  test.todo('parseAdjectivePredicate');
});

describe('Noun predicates', () => {
  test.each([
    ['dog', 'IsADog/1'],
    ['cat', 'IsACat/1'],
    ['bob cat', 'IsABobCat/1']
  ])('createNounPredicate("%s") = %s', (noun, p) => {
    expect(createNounPredicate(noun)).toBe(p);
  });
  
  describe('createNounPredicate() produces valid predicates', () => {
    const nouns = ['fish', 'bone', 'trumpet', 'pack mule'];
    const predicates = nouns.map(noun => createNounPredicate(noun));

    test.each(predicates)('"%s" is a valid predicate', P => {
      expect(isPredicate(P)).toBe(true);
    });
  });

  test.todo('parseNounPredicate');
});

describe('PredicateSyntax predicates', () => {
  test.each([
    [{verb:'eat', params:['subject', 'object']}, 'Eat_Subject_Object/2']
  ])('createPredicateSyntaxPredicate("%s") = %s', (syntax:{verb:string, params:string[]}, p) => {
    expect(createPredicateSyntaxPredicate(syntax)).toBe(p);
  });

  describe('createPredicateSyntaxPredicate() produces valid predicates', () => {
    const syntaxs = [
      {verb: 'eat', params:['subject', 'object']}
    ];
    const predicates = syntaxs.map(syntax => createPredicateSyntaxPredicate(syntax));

    test.each(predicates)('"%s" is a valid predicate', P => {
      expect(isPredicate(P)).toBe(true);
    });
  });

  test.todo('parsePredicateSyntaxPredicate');
});
