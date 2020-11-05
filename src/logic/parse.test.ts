import {isEntity} from './basics';
import {parseAssignment, parseSentence, parseArgs, SentenceRegex, wholeSentenceRegex, } from './parse';
import {parseTable, parseVariableTable, quickTruthTable, quickVariableTable} from './parseTable';
import {TruthTable} from './TruthTable';
import {VariableTable} from './VariableTable';

describe('Parsing logic-symbol strings', () => {
  describe('parseVariableTable', () => {
    test.each([
      'there exists x s.t. {P/1(x)=T}',
      `there exists x,y,z s.t. { P/1(x)=T & SitsUpon/2(y,  z)    = completelyfalse }`,
      `there exists x,y,z s.t. {
        P/1(x)=T & 
        SitsUpon/2(y,  z)    = completelyfalse
      }`,
      `∃ x,y,z s.t. {
        P/1(x)=T & 
        SitsUpon/2(y,  z)    = completelyfalse
      }`,
    ])('Can parse "%s"', str => {
      const table = parseVariableTable(str);
      expect(table).not.toBe(null);
      expect(table).toBeTruthy();
      if(table)
        expect(table).toBeInstanceOf(VariableTable);
    });
  });
  describe('parseTable', () => {
    test.each([
      [ '{ IsATable/1(a) = T & IsARoom/1(b) = T & Be_Subject_In/2(a, b)=T }',
        new TruthTable<string>()
          .assign({predicate: 'IsATable/1', args: ['a']}, 'T')
          .assign({predicate: 'IsARoom/1', args:['b']}, 'T')
          .assign({predicate: 'Be_Subject_In/2', args:['a', 'b']}, 'T')
      ],
    ])('parseTable(%j)', (str:string, table:TruthTable<string>) => {
      const parsed = parseTable(str);
      expect(parsed).toBeInstanceOf(TruthTable);
      if(parsed) {
        for(let {sentence, truth} of table.iterate()) {
          expect(parsed.lookUp(sentence)).toBe(truth);
        }
      }

    });
    test('Testing a simple table', () =>{
      const table = new TruthTable()
        .assign({predicate: 'p/1', args:['a']}, 'T');
      const parsed = parseTable(table.symbol);
      if(parsed)
        expect(parsed.symbol).toBe(table.symbol);
      else
        fail();
    });
  });
  describe('parseAssignment', () => {
    test.each([
      [
        'p/1(x)=T', 
        {sentence:{predicate: 'p/1', args:['x']}, truth:'T'}
      ],
      [ `SitsUpon/2(y,  z)    = completelyfalse`,
        {sentence:{predicate: 'SitsUpon/2', args:['y', 'z']}, truth:'completelyfalse'},
      ],
    ])('parseAssignment(%j) = %o', (str:string, expectation) => {
      expect(parseAssignment(str)).toStrictEqual(expectation);
    });
  });
  describe('parseSentence()', () => {
    test.each([
      ['p/1(a)', {predicate:'p/1', args:['a']},]
    ])('parseSentence(%j) = %o', (str:string, expectedParse) => {
      expect(parseSentence(str)).toStrictEqual(expectedParse);
    });
  });

  describe('parseArgs()', () => {
    test.each([
      ['a', ['a']],
      ['a, b', ['a', 'b']],
      ['a   ,b', ['a', 'b']],
      ['((', null],
    ] as [string, any][])('parseArgs(%j) = %j', (str:string, expectedParse) => {
      expect(parseArgs(str)).toStrictEqual(expectedParse);
    });
  });

  const validSentences = ['p/1(a)']
  describe('wholeSentenceRegex matches valid sentences', () => {
    test.each(validSentences)('wholeSentenceRegex matches %s', (str) => {
      expect(wholeSentenceRegex.test(str)).toBe(true);
    });
  });

  describe('SentenceRegex matches valid sentences', () => {
    test.each(validSentences)('SentenceRegex matches %s', (str) => {
      expect(SentenceRegex.test(str)).toBe(true);
    });
  });

  describe('Known/past bugs', () => {
    test('Teenage dirtbag table', () => {
      expect(isEntity('me')).toBe(true);
      expect(parseAssignment('IsTeenage/1(me) = T')).toStrictEqual({
        sentence: {
          predicate: 'IsTeenage/1',
          args: ['me'],
        },
        truth: 'T',
      })


      let standard = quickTruthTable(`{
        IsTeenage/1(me) = T
        Listen_Subject_To/2(me, b) = T
        IsIron/1(b) = T
        IsAMaiden/1(b) = T
      }`);

      expect(standard).toBeInstanceOf(TruthTable);

      let claim1 = quickVariableTable(`there exists x s.t. {
        IsTeenage/1(x) = T
        IsADirtbag/1(x) = T
      }`);

      expect(claim1).toBeInstanceOf(VariableTable);

    });
  });
});
