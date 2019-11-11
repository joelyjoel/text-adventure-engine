import { Sentence, Predicate, Entity, TruthTable } from ".";



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