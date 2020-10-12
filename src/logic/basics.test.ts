import {Entity, createEntity, isEntity, Variable, isVariable, createVariable, Predicate, isPredicate, createPredicate, Sentence, isSentence, getNumberOfArguments, stringifyArgs, stringifySentence} from './basics'

describe('Testing basic logic typings, typeguards and creator functions', () => {

  const validEntities = ['a', 'b', 'c', 'a1', 'b1', 'c1', 'a99', 'b44', 'c_myownnose', 'a_myownnose95']
;
  const validVariables = [
    'x', 'y', 'z',
    'x1', 'y1', 'z1',
    'x99', 'y97', 'z83654832',
    'x_____', 'y_vkjndjvdsljg', 'zebra',
  ];

  const validPredicates =[
    'P/2', 'Q/1', 'R/50', 'P_jumpsOver/2', 'P50/2'
  ] 

  describe('Entity type', () => {
    describe('isEntity() correctly identifies valid entities', () => {
      test.each(validEntities)('"%s" is a valid entity', e => {
        expect(isEntity(e)).toBe(true);
      })
    });

    describe('isEntity() correctly rejects invalid entities', () => {
      test.each([
        89,
        {id: 10},
        'poo',
      ])('"%s" is not a valid entity', e => {
        expect(isEntity(e)).toBe(false);
      });
    });

    describe('isEntity rejects predicates', () => {
      test.each(validPredicates)('%s is not an entity', P => {
        expect(isEntity(P)).toBe(false);
      });
    });

    describe('createEntity() creates valid Entities', () => {
      test.each([
        createEntity(), createEntity(), createEntity(), createEntity(),
      ])('"%s" is a valid entity', e => {
        expect(isEntity(e)).toBe(true);
      })
    });
  });

  
  
  describe('Variables type', () => {
    
    describe('isVariable() correctly identifies valid variables', () => {
      test.each(validVariables)('"%s" is a valid variable', x => {
        expect(isVariable(x)).toBe(true);
      });
    });

    describe('isVariable correctly rejects non-variable entities', () => {
      test.each(validEntities)('"%s" is not a valid variable', x => {
        expect(isVariable(x)).toBe(false);
      });
    });

    describe('isVariable rejects predicates', () => {
      test.each(validPredicates)('%s is not a variable', P => {
        expect(isVariable(P)).toBe(false);
      });
    });
    

    describe('isVariable() correctly rejects invalid variables', () => {
      test.each([
        89, {id: 10}, 'poo',
      ])('"%s" is not a valid variable', x => {
        expect(isVariable(x)).toBe(false);
      });
    });

    describe('All variables are also entities', () => {
      test.each(validVariables)('"%s" is a valid entity', x => {
        expect(isEntity(x)).toBe(true);
      });
    })

    describe('createVariable() creates valid variables', () => {
      test.each([
        createVariable(),
        createVariable(),
        createVariable(),
        createVariable(),
      ])('"%s" is a valid variable', x => {
        expect(isVariable(x)).toBe(true);
      });
    });
  });


  describe('Predicate type', () => {
    describe('isPredicate correctly identifies valid predicates', () => {
      test.each(validPredicates)('"%s" is a valid predicate', P => {
        expect(isPredicate(P)).toBe(true);
      });
    });
    describe('isPredicate correctly rejects invalid predicates', () => {
      test.each([
        'horse', 'F', {}, null, undefined, NaN
      ])('"%s" is not a predicate', x => {
        expect(isPredicate(x)).toBe(false);
      })
    });
    describe('isPredicate correctly rejects entities and variables', () =>{
      test.each([
        ...validVariables,
        ...validEntities,
      ])('%o is not a predicate', x => {
        expect(isPredicate(x)).toBe(false);
      });
    });
    describe('createPredicate creates valid predicates', () => {
      test.each([
        createPredicate(1), createPredicate(4), createPredicate(1), createPredicate(40),
      ])('"%s" is a valid predicate', P => {
        expect(isPredicate(P)).toBe(true);
      });
    });
    describe('getNumberOfArguments correctly identifies how many arguments a predicate accepts', () => {
      test.each([
        ['P/2', 2],
        ['Q/99', 99],
        ['R/0', 0],
        ['Qwertyuikmcxh_djbfvhbbhbsfv/5', 5],
        [createPredicate(10), 10],
      ])('%s has %o arguments', (P:Predicate, n:number) => {
        expect(getNumberOfArguments(P)).toBe(n)
      });
    });
  });

  describe('Sentence type', () => {
    describe('isSentence correctly identifies valid sentences', () => {
      test.each([
        {predicate: 'P/1', args:['a']},
        {predicate: 'R/2', args: ['b', 'c_2']},
        {predicate: 'Q/5', args: ['a', 'a', 'a', 'a', 'a']},
      ])('%o is a valid sentence', S => {
        expect(isSentence(S)).toBe(true)
      })
    });
    describe('isSentence correctly rejects invalid sentences', () => {
      test.each([
        {p:'P/2', args: ['a', 'b']},
        {predicate: null, args: ['a', 'b']},
        {predicate: 'P/2', arumnets: ['a', 'b']},
        {predicate: 'P/2', args: null},
      ])('%o is not a sentence', x => {
        expect(isSentence(x)).toBe(false);
      })
    });
    describe('isSentence rejects sentences with the wrong number of arguments', () => {
      test.each([
        {predicate:'P/1', args: ['a', 'a']},
        {predicate:'P/5', args: ['b']},
      ])('%o is not a valid sentence', S => {
        expect(isSentence(S)).toBe(false);
      });
    });

    describe('stringifyArgs()', () => {
      test.each([
        [{predicate: 'P/2', args:['a', 'b']}, 'a,b'],
      ])('%o becomes "%s"', (S:Sentence, str) => {
        expect(stringifyArgs(S)).toBe(str)
      });
    });

    describe('stringifySentence()', () => {
      test.each([
        [{predicate: 'P/2', args:['a', 'b']}, 'P/2(a,b)'],
      ])('%o becomes "%s"', (S:Sentence, str) => {
        expect(stringifySentence(S)).toBe(str);
      });
    });
  });
});
