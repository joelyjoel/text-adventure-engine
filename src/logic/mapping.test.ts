import { Entity, Variable, Sentence, Predicate, createEntity, createVariables, createPredicate, createEntities} from './basics';
import { identifyVarPositions, mapFromSingleSentence, findMappings, combinePartialMappings, findCompleteMappings } from "./mapping";
import { TruthTable } from "./TruthTable";
import { VariableTable } from "./VariableTable";

test('Identifying sentence variable positions', () => {
  let [x, y, z] = createVariables();
  let a = createEntity();
  let P = createPredicate(4);

  expect(identifyVarPositions([x,y,z], {predicate:P, args:[x,x,a,y]}))
    .toStrictEqual([[0,1], [3], null])
})

test('Finding a partial mapping from a single sentence', () => {
  let [x, y, z] = createVariables();
  let [a, b, c, d] = createEntities();
  let P = createPredicate(2);
  let Q = createPredicate(4);

  let table = new TruthTable()
    .assign({predicate:P, args:[a, b]}, 'true')
    .assign({predicate:P, args:[a, c]}, 'true')
    .assign({predicate:Q, args:[a, a, c,d]}, 'true')
    .assign({predicate:Q, args:[a, b, c, d]}, 'true')

  let [...mappings] = mapFromSingleSentence(
    [x,y,z], 
    {sentence: {predicate:P, args:[a, x]}, truth:'true'}, 
    table
  )

  expect(mappings).toStrictEqual([
    [b, null, null],
    [c, null, null]
  ])

  let [...mappings2] = mapFromSingleSentence(
    [x, y, z],
    {sentence: {predicate:P, args:[a, b]}, truth:'true'},
    table
  )
  expect(mappings2).toStrictEqual([[null, null, null]])

  let [...mappings3] = mapFromSingleSentence(
    [x,y,z],
    {sentence: {predicate:Q, args:[x,x,y,z]}, truth:'true'},
    table
  );

  expect(mappings3).toStrictEqual([[a,c,d]]);
})

test('Partial mapping arithmetic', () => {
  let [a,b,c,d] = createEntities();

  expect(combinePartialMappings([a, null], [null, b]))
    .toStrictEqual([a, b]);

  expect(combinePartialMappings([a, null, a], [a, null, null]))
    .toStrictEqual([a, null, a]);

  expect(combinePartialMappings([a,b,c], [b,c,a])).toBeNull();
})

test('Finding mappings from an existential table', () => {
  let [x,y] = createVariables();
  let [a,b,c,d] = createEntities();
  let P = createPredicate(2);
  let Q = createPredicate(4);

  let table = new TruthTable()
    .assign({predicate:P, args:[a, b]}, 'true')
    .assign({predicate: P, args:[b, c]}, 'true')
    .assign({predicate: Q, args:[a,b, c, d]}, 'true')

  let claim = new VariableTable(x, y)
    .assign({predicate:P, args:[x, y]}, 'true')
    .assign({predicate:P, args:[y, c]}, 'true')

  expect(findMappings(claim, table))
    .toStrictEqual([[a, b]])

  let claim2 = new VariableTable(x, y)
    .assign({predicate:P, args:[x, y]}, 'true')

  
  expect(findMappings(claim2, table)).toContainEqual([a, b])
  expect(findMappings(claim2, table)).toContainEqual([b, c])
})

test('Finding mappings given a starting mapping', () => {
  let [x,y,z, x1] = createVariables();
  let [a,b,c,d] = createEntities();
  let P = createPredicate(2);

  let table = new TruthTable()
    .assign({predicate:P, args:[a, b]}, 'T')
    .assign({predicate:P, args:[c, d]}, 'T')

  let addition = new TruthTable()
    .assign({predicate:P, args:[b, c]}, 'T');

  let claim = new VariableTable(x,y,z,x1)
    .assign({predicate:P, args:[x, y]}, 'T')
    .assign({predicate:P, args:[y, z]}, 'T')
    .assign({predicate:P, args:[z, x1]}, 'T')

  let stg = findCompleteMappings(claim, [addition, table]);
  expect(stg).toStrictEqual([
    [a,b,c,d]
  ]);
})
