import { parseArticle } from "./parseIdentifier"
import { Dictionary } from "../Dictionary";
import { parseNounPhrase } from "./parseNounPhrase";

// Articles
test('definite article test', () => {
  let parse = parseArticle('the very special cat');

  expect(parse).toBeTruthy();
  if(parse) {
    expect(parse.str).toBe('the very special cat');
    expect(parse.from).toBe(0);
    expect(parse.to).toBe(3);
    expect(parse.pos).toBe('article');
    expect(parse.identifier).toBe('the');
  }
})

test('indefinite article test', () => {
  let parse = parseArticle('a very special cat');

  expect(parse).toBeTruthy();
  if(parse) {
    expect(parse.str).toBe('a very special cat');
    expect(parse.from).toBe(0);
    expect(parse.to).toBe(1);
    expect(parse.pos).toBe('article');
    expect(parse.identifier).toBe('a');
  }
})

test('parseNounPhrase test 1', () => {
  const dictionary = new Dictionary;
  dictionary.addNouns('cat', 'dog');
  dictionary.addAdjectives('big', 'small');

  const str = 'the big dog';
  const parse = parseNounPhrase(str, dictionary);

  expect(parse).toMatchObject({
    str: str,
    from: 0,
    to: str.length,
    identifier: {
      identifier: 'the',
      pos: 'article',
      from: 0,
      to: 3,
    },
    adjectives: [{
      adj: {str: 'big'}
    }],
    noun: {
      noun: {str: 'dog'}
    }
  })
});

test('Parsing phrasal nouns and adjectives', () => {
  const dict = new Dictionary()
    .addNouns('bumper car', 'buddhist monk')
    .addAdjectives('free wheeling', 'sly')

  const parse = parseNounPhrase('my sly free wheeling buddhist monk', dict);
  expect(parse).toBeTruthy();
  if(parse) {
    expect(parse.identifier.identifier).toBe('my')
    expect(parse.adjectives[0].adj.str).toBe('sly');
    expect(parse.adjectives[1].adj.str).toBe('free wheeling');
    expect(parse.noun.noun.str).toBe('buddhist monk');
  }
})