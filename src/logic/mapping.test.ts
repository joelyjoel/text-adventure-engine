import { Variable } from "./Variable"
import { Entity } from "./Entity";
import { Sentence } from "./Sentence";
import { Predicate } from "./Predicate";
import { identifyVarPositions, mapFromSingleSentence, findMappings, combinePartialMappings } from "./mapping";
import { TruthTable } from "./TruthTable";
import { VariableTable } from "./VariableTable";

test('Identifying sentence variable positions', () => {
  let [x, y, z] = Variable.bulk();
  let a = new Entity;
  let P = new Predicate(4);

  expect(identifyVarPositions([x,y,z], new Sentence(P, x,x,a,y)))
    .toStrictEqual([[0,1], [3], null])
})

test('Finding a partial mapping from a single sentence', () => {
  let [x, y, z] = Variable.bulk();
  let [a, b, c, d] = Entity.bulk();
  let P = new Predicate(2);
  let Q = new Predicate(4);

  let table = new TruthTable()
    .assign(new Sentence(P, a, b), 'true')
    .assign(new Sentence(P, a, c), 'true')
    .assign(new Sentence(Q, a, a, c,d), 'true')
    .assign(new Sentence(Q, a, b, c, d), 'true')

  let [...mappings] = mapFromSingleSentence(
    [x,y,z], 
    {sentence: new Sentence(P, a, x), truth:'true'}, 
    table
  )

  expect(mappings).toStrictEqual([
    [b, null, null],
    [c, null, null]
  ])

  let [...mappings2] = mapFromSingleSentence(
    [x, y, z],
    {sentence: new Sentence(P, a, b), truth:'true'},
    table
  )
  expect(mappings2).toStrictEqual([[null, null, null]])

  let [...mappings3] = mapFromSingleSentence(
    [x,y,z],
    {sentence: new Sentence(Q, x,x,y,z), truth:'true'},
    table
  );

  expect(mappings3).toStrictEqual([[a,c,d]]);
})

test('Partial mapping arithmetic', () => {
  let [a,b,c,d] = Entity.bulk();

  expect(combinePartialMappings([a, null], [null, b]))
    .toStrictEqual([a, b]);

  expect(combinePartialMappings([a, null, a], [a, null, null]))
    .toStrictEqual([a, null, a]);

  expect(combinePartialMappings([a,b,c], [b,c,a])).toBeNull();
})

test('Finding mappings from an existential table', () => {
  let [x,y] = Variable.bulk();
  let [a,b,c,d] = Entity.bulk();
  let P = new Predicate(2);
  let Q = new Predicate(4);

  let table = new TruthTable()
    .assign(new Sentence(P, a, b), 'true')
    .assign(new Sentence(P, b, c), 'true')
    .assign(new Sentence(Q, a,b, c, d), 'true')

  let claim = new VariableTable(x, y)
    .assign(new Sentence(P, x, y), 'true')
    .assign(new Sentence(P, y, c), 'true')

  expect(findMappings(claim, table))
    .toStrictEqual([[a, b]])

  let claim2 = new VariableTable(x, y)
    .assign(new Sentence(P, x, y), 'true')

  
  expect(findMappings(claim2, table)).toContainEqual([a, b])
  expect(findMappings(claim2, table)).toContainEqual([b, c])
})