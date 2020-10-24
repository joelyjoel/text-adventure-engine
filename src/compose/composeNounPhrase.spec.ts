import { composeNounPhrase } from "./composeNounPhrase"

test('composing noun phrases', () => {
  expect(composeNounPhrase({
    definite: true,
    noun: 'cat',
  })).toBe('the cat');

  expect(composeNounPhrase({
    article: 'the',
    noun: 'cat',
  })).toBe('the cat');

  expect(composeNounPhrase({
    noun: 'cat',
    adjectives: ['big', 'hairy'],
  })).toBe('the big hairy cat');

  expect(composeNounPhrase({
    properNoun: 'Susan',
  })).toBe('Susan');

  expect(composeNounPhrase({
    noun: 'cat',
    plural: true,
  })).toBe('the cats');

  expect(composeNounPhrase({
    noun: 'cat',
    plural: true,
    indefinite: true
  })).toBe('some cats');

  expect(composeNounPhrase({
    noun:'fish',
    plural: true,
  })).toBe('the fish');

  expect(composeNounPhrase({
    possessor: 'me',
    noun: 'cat',
  })).toBe('my cat');

  expect(composeNounPhrase({
    possessor: 'I',
    noun: 'dog',
  })).toBe('my dog');

  expect(composeNounPhrase({
    possessor: 'my',
    noun: 'sphinx',
  })).toBe('my sphinx');

  expect(composeNounPhrase({
    possessor: 'Henry',
    adjectives: ['left'],
    noun: 'cheek',
  })).toBe(`Henry's left cheek`)
})
