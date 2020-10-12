import { 
  Sentence, 
  Predicate, 
  Entity, 
  TruthTable, 
  Variable, 
  VariableTable, 
  createEntity, 
  createPredicate,
  stringifySentence,
  createVariable,
  createEntities,
  createVariables
} from "./index";



test('Truth assignments and look-up', () => {
  const table = new TruthTable;

  let P = createPredicate(2);
  let a = createEntity();
  let b = createEntity();

  let S1:Sentence = {predicate:P, args: [a,b]};
  let S2:Sentence = {predicate:P, args:[b,a]};

  table.assign(S1, 'past');

  expect(table.lookUp(S1)).toBe('past');
  expect(table.lookUp(S2)).toBe(table.defaultTruthValue);
  expect(table.entities).toStrictEqual([a, b]);
})

test('Truth table identity', () => {
  let table = new TruthTable;

  let P = createPredicate(2);

  let a = createEntity();
  let b = createEntity();
  let c = createEntity();
  let d = createEntity();

  table.assign({predicate:P, args:[a,b]}, 'true')
  table.makeIdentical(c, b);

  expect(stringifySentence(table.idMapSentence({predicate: P, args:[a,b]})))
    .toBe(stringifySentence({predicate:P, args: [a,c]}));

  expect(table.lookUp({predicate: P, args:[a,c]}))
    .toBe('true');

  expect(table.lookUp({predicate: P, args:[a,b]})).toBe('true');
  expect(table.lookUp({predicate: P, args: [a,c]})).toBe('true');

  table.assign({predicate: P, args:[b,a]}, 'true');
  
  expect(table.lookUp({predicate: P, args:[b,a]})).toBe('true');
  expect(table.lookUp({predicate: P, args:[c, a]})).toBe('true');

  expect(table.entities.includes(b)).toBe(false);


  // Identity without identity map.
  table.makeIdentical(a, d, false);
  expect(table.lookUp({predicate:P, args:[a,b]})).toBe('true');
  expect(table.lookUp({predicate: P,args:[d,b]})).toBe(table.defaultTruthValue);

  table.makeIdentical(d, a, false);
  expect(table.lookUp({predicate:P, args:[a,b]})).toBe(table.defaultTruthValue);
  expect(table.lookUp({predicate:P, args:[d,b]})).toBe('true');
})

test('Cloning a truth table', () => {
  const P = createPredicate(1);
  const Q = createPredicate(2);
  const a = createEntity();
  const b = createEntity();

  const table1 = new TruthTable;
  table1.assign({predicate: P, args:[a]}, 'true');
  table1.assign({predicate:Q, args:[a, b]}, 'true');

  const table2 = table1.clone();
  expect(table2.lookUp({predicate: P, args:[a]})).toBe('true');
  expect(table2.lookUp({predicate: Q, args:[a, b]})).toBe('true');
})

test('VariableTable', () => {
  // Construct a variable table
  const P = createPredicate(1);
  const Q = createPredicate(1);
  const x = createVariable();;
  const y = createVariable();;

  const varTable = new VariableTable;
  varTable.addVariables(x, y);
  varTable.assign({predicate:P, args:[x]}, 'true');
  varTable.assign({predicate:Q, args:[y]}, 'true');

  // Make a substitution of that table.
  const a = createEntity();
  const b = createEntity();
  let subbed = varTable.substitute(a, b);

  // Assert that the subsitution worked
  expect(subbed.lookUp({predicate: P, args:[x]})).toBe(subbed.defaultTruthValue);
  expect(subbed.lookUp({predicate:Q, args:[y]})).toBe(subbed.defaultTruthValue);
  expect(subbed.lookUp({predicate:P, args:[a]})).toBe('true');
  expect(subbed.lookUp({predicate:P, args:[b]})).toBe(subbed.defaultTruthValue);
  expect(subbed.lookUp({predicate:Q, args:[a]})).toBe(subbed.defaultTruthValue);
  expect(subbed.lookUp({predicate:Q, args:[b]})).toBe('true');
  
  // Assert that the var table was uneffected.
  expect(varTable.lookUp({predicate:P, args:[x]})).toBe('true');
  expect(varTable.lookUp({predicate:Q, args:[y]})).toBe('true');
  expect(varTable.lookUp({predicate:P, args:[a]})).toBe(varTable.defaultTruthValue);
  expect(varTable.lookUp({predicate:Q, args:[b]})).toBe(varTable.defaultTruthValue);
})

test('VariableTable::findMappingErrors', () => {
  const P = createPredicate(1);
  const Q = createPredicate(2);
  const a = createEntity();
  const b = createEntity();

  let theTruth = new TruthTable;
  theTruth.assign({predicate: P, args:[a]}, 'true');
  theTruth.assign({predicate: Q, args:[a, b]}, 'maybe');

  let hypothesis = new VariableTable;
  hypothesis.addVariables(createVariable(), createVariable());
  const [x, y] = hypothesis.variables;
  hypothesis.assign({predicate: Q, args:[x, y]}, 'maybe');

  expect(hypothesis.findMappingErrors(theTruth, [a, b]))
    .toBe(null);
  expect(hypothesis.testMapping(theTruth, [a, b])).toBe(true);

  // Add another sentence to my hypothesis
  hypothesis.assign({predicate: P, args:[x]}, 'true');

  expect(hypothesis.findMappingErrors(theTruth, [a, b]))
    .toBe(null);
  expect(hypothesis.testMapping(theTruth, [a, b])).toBe(true);


  // Add a sentence that shouldn't match theTruth
  hypothesis.assign({predicate: P, args:[y]}, 'true');
  expect(hypothesis.findMappingErrors(theTruth, [a, b]))
    .toStrictEqual([{predicate: P, args:[b]}]);
  expect(hypothesis.testMapping(theTruth, [a, b])).toBe(false);
  expect(hypothesis.findMappingErrors(theTruth, [b, a]))
    .toHaveLength(2);
  expect(hypothesis.testMapping(theTruth, [b, a])).toBe(false);
})

test('Merging VariableTables', () => { 

  // Create two variable tables
  let [x, y, z] = createVariables();
  let P = createPredicate(2);
  let table1 = new VariableTable(x, y);
  table1.assign({predicate: P, args:[x, y]}, 'true');
  let table2 = new VariableTable(y, z);
  table2.assign({predicate: P, args:[y, z]}, 'true');

  table1.merge(table2);
  expect(table1.variables).toStrictEqual([x,y,z]);
  expect(table1.lookUp({predicate: P, args:[x, y]})).toBe('true');
  expect(table1.lookUp({predicate: P, args:[y, z]})).toBe('true');
  expect(table2.lookUp({predicate: P, args:[x, y]}))
    .toBe(table2.defaultTruthValue);
})

test('Implementing a VariableTable', () => {
  let P = createPredicate(2);
  let [a, b, c, d] = createEntities();
  let [x, y] = createVariables()
  let vt = new VariableTable(x, y)
    .assign({predicate: P, args:[a, x]}, 'true')
    .assign({predicate: P, args:[y, d]}, 'true')

  let table = vt.implement(b, c)
})

test('Spawning a variable table', () => {
  
})
