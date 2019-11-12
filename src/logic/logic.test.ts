import { Sentence, Predicate, Entity, TruthTable, Variable, VariableTable } from ".";



test('Truth assignments and look-up', () => {
  const table = new TruthTable;

  let P = new Predicate(2)
  let a = new Entity;
  let b = new Entity;

  let S1 = new Sentence(P, a, b);
  let S2 = new Sentence(P, b, a);

  table.assign(S1, 'past');

  expect(table.lookUp(S1)).toBe('past');
  expect(table.lookUp(S2)).toBe(table.defaultTruthValue);
  expect(table.entities).toStrictEqual([a, b]);
})

test('Truth table identity', () => {
  let table = new TruthTable;

  let P = new Predicate(2)

  let a = new Entity();
  let b = new Entity();
  let c = new Entity();
  let d = new Entity();

  table.assign(new Sentence(P, a, b), 'true')
  table.makeIdentical(c, b);

  expect(table.idMapSentence(new Sentence(P, a, b)).symbol)
    .toBe(new Sentence(P,a,c).symbol);

  expect(table.sentenceIndex[new Sentence(P, a, c).symbol].truth)
    .toBe('true');

  expect(table.lookUp(new Sentence(P, a, b))).toBe('true');
  expect(table.lookUp(new Sentence(P, a, c))).toBe('true');

  table.assign(new Sentence(P, b, a), 'true');
  
  expect(table.lookUp(new Sentence(P, b, a))).toBe('true');
  expect(table.lookUp(new Sentence(P, c, a))).toBe('true');

  expect(table.entities.includes(b)).toBe(false);


  // Identity without identity map.
  table.makeIdentical(a, d, false);
  expect(table.lookUp(new Sentence(P,a,b))).toBe('true');
  expect(table.lookUp(new Sentence(P,d,b))).toBe(table.defaultTruthValue);

  table.makeIdentical(d, a, false);
  expect(table.lookUp(new Sentence(P,a,b))).toBe(table.defaultTruthValue);
  expect(table.lookUp(new Sentence(P,d,b))).toBe('true');
})

test('Cloning a truth table', () => {
  const P = new Predicate(1);
  const Q = new Predicate(2);
  const a = new Entity;
  const b = new Entity;

  const table1 = new TruthTable;
  table1.assign(new Sentence(P, a), 'true');
  table1.assign(new Sentence(Q, a, b), 'true');

  const table2 = table1.clone();
  expect(table2.lookUp(new Sentence(P, a))).toBe('true');
  expect(table2.lookUp(new Sentence(Q, a, b))).toBe('true');
})

test('VariableTable', () => {
  // Construct a variable table
  const P = new Predicate(1);
  const Q = new Predicate(1);
  const x = new Variable;
  const y = new Variable;

  const varTable = new VariableTable;
  varTable.addVariables(x, y);
  varTable.assign(new Sentence(P, x), 'true');
  varTable.assign(new Sentence(Q, y), 'true');

  // Make a substitution of that table.
  const a = new Entity;
  const b = new Entity;
  let subbed = varTable.substitute(a, b);

  // Assert that the subsitution worked
  expect(subbed.lookUp(new Sentence(P, x))).toBe(subbed.defaultTruthValue);
  expect(subbed.lookUp(new Sentence(Q, y))).toBe(subbed.defaultTruthValue);
  expect(subbed.lookUp(new Sentence(P, a))).toBe('true');
  expect(subbed.lookUp(new Sentence(P, b))).toBe(subbed.defaultTruthValue);
  expect(subbed.lookUp(new Sentence(Q, a))).toBe(subbed.defaultTruthValue);
  expect(subbed.lookUp(new Sentence(Q, b))).toBe('true');
  
  // Assert that the var table was uneffected.
  expect(varTable.lookUp(new Sentence(P, x))).toBe('true');
  expect(varTable.lookUp(new Sentence(Q, y))).toBe('true');
  expect(varTable.lookUp(new Sentence(P, a))).toBe(varTable.defaultTruthValue);
  expect(varTable.lookUp(new Sentence(Q, b))).toBe(varTable.defaultTruthValue);
})

test('VariableTable::findMappingErrors', () => {
  const P = new Predicate(1);
  const Q = new Predicate(2);
  const a = new Entity;
  const b = new Entity;

  let theTruth = new TruthTable;
  theTruth.assign(new Sentence(P, a), 'true');
  theTruth.assign(new Sentence(Q, a, b), 'maybe');

  let hypothesis = new VariableTable;
  hypothesis.addVariables(new Variable, new Variable);
  const [x, y] = hypothesis.variables;
  hypothesis.assign(new Sentence(Q, x, y), 'maybe');

  expect(hypothesis.findMappingErrors(theTruth, [a, b]))
    .toBe(null);
  expect(hypothesis.testMapping(theTruth, [a, b])).toBe(true);

  // Add another sentence to my hypothesis
  hypothesis.assign(new Sentence(P, x), 'true');

  expect(hypothesis.findMappingErrors(theTruth, [a, b]))
    .toBe(null);
  expect(hypothesis.testMapping(theTruth, [a, b])).toBe(true);


  // Add a sentence that shouldn't match theTruth
  hypothesis.assign(new Sentence(P, y), 'true');
  expect(hypothesis.findMappingErrors(theTruth, [a, b]))
    .toStrictEqual([new Sentence(P, b)]);
  expect(hypothesis.testMapping(theTruth, [a, b])).toBe(false);
  expect(hypothesis.findMappingErrors(theTruth, [b, a]))
    .toHaveLength(2);
  expect(hypothesis.testMapping(theTruth, [b, a])).toBe(false);
})

test('Merging VariableTables', () => { 

  // Create two variable tables
  let [x, y, z] = Variable.bulk();
  let P = new Predicate(2);
  let table1 = new VariableTable(x, y);
  table1.assign(new Sentence(P, x, y), 'true');
  let table2 = new VariableTable(y, z);
  table2.assign(new Sentence(P, y, z), 'true');

  table1.merge(table2);
  expect(table1.variables).toStrictEqual([x,y,z]);
  expect(table1.lookUp(new Sentence(P, x, y))).toBe('true');
  expect(table1.lookUp(new Sentence(P, y, z))).toBe('true');
  expect(table2.lookUp(new Sentence(P, x, y)))
    .toBe(table2.defaultTruthValue);
})