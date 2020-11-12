import {getSynonyms, isSynonym, getHypernymsGrouped, getHypernyms, isHypernym, getRelation} from './words';

describe('getSynonyms', () => {
  test.each([
    ['hot', [ 'hot', 'live', 'red-hot', 'spicy', 'blistering', 'raging' ]],
  ])('getSynonyms(%s) = %j', async (word:string, expectedSynonyms:string[]) => {
    let result = await getSynonyms(word);
    for(let s of expectedSynonyms)
      expect(result).toContain(s);
  });
});

describe('isSynonym is consistent with getSynonyms', () => {
  test.each([
    ['hot', 'spicy'],
  ])('%s is synonymous with %s', async (a:string, b:string) => {
    expect(await isSynonym(a, b)).toBe(true);
  });
});

test.todo('getHypernymsGrouped',/* async () => {
  console.log(await getHypernymsGrouped('gay'));
}*/);

test.todo('getHypernyms', /*async () => {*/
  //console.log(...await getHypernyms('blue'));
/*}*/);

describe('isHypernym', () => {
  test.each([
    ['canine', 'dog'],
    ['feline', 'cat'],
  ])('%s is a hypernym of %s', async (a, b) => {
    expect(await isHypernym(a, b)).toBe(true);
  });
});

describe('getRelation', () => {
  test.each([
    ['canine', 'dog', 'hypernym'],
    ['dog', 'canine', 'hyponym'],
    ['hot', 'spicy', 'synonym'],
  ])('getRelation(%s, %s) = %s', async (a, b, relation) => {
    expect(await getRelation(a, b)).toBe(relation);
  });
});
