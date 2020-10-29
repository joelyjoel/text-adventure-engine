import {TruthTable} from './';
import {quickAdditionTable} from './parseTable';

describe('AdditionTable', () => {
  test('creating addition tables from symbolic logic string.', () => {
    let table = quickAdditionTable(
      `{P/1(a)=T & Q/2(a, b)=F}`,
      `{R/1(a) = T & P/1(a) = F}`,
    );

    expect(table.lookUp('P/1(a)')).toBe('F');
    expect(table.lookUp('R/1(a)')).toBe('T');
    expect(table.lookUp('Q/2(a,b)')).toBe('F');
    expect(table.lookUp('Fake/1(a)')).toBe('?');
    expect(table.parent).toBeInstanceOf(TruthTable);
    if(table.parent)
      expect(table.parent && table.parent.lookUp('P/1(a)')).toBe('T');

  });

  test.todo('lookUp() method');
  test('remove() method', () => {
    let table = quickAdditionTable(
      `{P/1(a)=T & Q/2(a, b)=F}`,
      `{R/1(a) = T & P/1(a) = F}`,
    );

    // Remove a sentence from the addition
    table.remove('R/1(a)');

    expect(table.lookUp('R/1(a)')).toBe('?');

    // (psuedo-)remove an assignment from the parent
    table.remove('P/1(a)');

    expect(table.lookUp('P/1(a)')).toBe('?');
    expect(table.parent).toBeInstanceOf(TruthTable);
    if(table.parent)
      expect(table.parent.lookUp('P/1(a)')).toBe('T');
  });
  test.todo('byPredicate() iterator method');
  test('predicates() acessor', () => {
    let table = quickAdditionTable(
      '{P/1(a) = T & Q/2(a, b) = T}',
      '{P/1(b) = T}'
    );
    const predicates = table.predicates;
    expect(predicates).toHaveLength(2);
    expect(predicates).toContain('P/1');
    expect(predicates).toContain('Q/2');
  });
  test.todo('clone() method');
  test.todo('predicates() acessor');
  test.todo('makeIdentical() method');
  test.todo('toString() method');
  test.todo('idMapEntity() method');
  test.todo('idMapSentence() method');

  test.todo('checkCompatible() method');
  test.todo('measureCompatibility() method');
  test.todo('hasContradictionsWith() method');
  test.todo('filter() method');
  test.todo('involving() method')
  test.todo('merge()/eat()');

  test.todo('Stacking multiple addition tables');
  test.todo('Swapping parent tables of an addition table');

  describe('new methods', () => { 
    test.todo('flatten() method');
    test.todo('mergeToParent() method');
    test.todo('height/stackSize accessors');
    test.todo('addition() accessor');
    test.todo('iterateAddition() iterator method');
  });

  describe('External functions', () => {
    test.todo('findMappings onto AdditionTable');
    test.todo('findImperfectMappings onto AdditionTable');
  });
});
