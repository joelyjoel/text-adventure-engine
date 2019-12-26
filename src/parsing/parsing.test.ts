import { parseArticle } from "./parseIdentifier"
import { Dictionary } from "../Dictionary";
import { parseSimpleNounPhrase, parseNounPhrase } from "./parseNounPhrase";
import { shallowParseStatement, parseStatement } from "./parseStatement";
import { Context } from "../Context";

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

test('parseSimpleNounPhrase test 1', () => {
  const dictionary = new Dictionary;
  dictionary.addNouns('cat', 'dog');
  dictionary.addAdjectives('big', 'small');

  const str = 'the big dog';
  const parse = parseSimpleNounPhrase(str, dictionary);

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

  const parse = parseSimpleNounPhrase('my sly free wheeling buddhist monk', dict);
  expect(parse).toBeTruthy();
  expect(parse).toMatchObject({
    identifier: {
      identifier: 'my',
    },
    adjectives: [{adj:{str:'sly'}}, {adj:{str:'free wheeling'}}],
    noun: {noun: {str:'buddhist monk'}}
  })
  // if(parse && parse.syntaxKind == 'basic') {
  //   expect(parse.identifier.identifier).toBe('my')
  //   expect(parse.adjectives[0].adj.str).toBe('sly');
  //   expect(parse.adjectives[1].adj.str).toBe('free wheeling');
  //   expect(parse.noun.noun.str).toBe('buddhist monk');
  // }
})

test("Shallow parsing a simple statement", () => {
  const dict = new Dictionary();
  dict.addNouns('dog', 'messiah');

  let [parse] = shallowParseStatement('the messiah is a dog', dict);

  expect(parse).toBeTruthy();
  if(parse) {
    expect(parse.args[0]).toBe('the messiah');
    expect(parse.syntax.predicate).toBeDefined();
    if(parse.syntax.predicate)
      expect(parse.syntax.predicate.symbol).toMatch(/isADog$/);
  }
})

test("Deep parsing a simple statement", () => {
  const dict = new Dictionary().addNouns('dutch barge').addAdjectives('warm');
  const ctx = new Context(dict);

  let [parse] = parseStatement('the dutch barge is warm', ctx)

  expect(parse).toBeTruthy();
  if(parse) {
    expect(typeof parse.args[0]).toBe('object');
  }
})

test('Parsing a complex nounphrases.', () => {
  const dict = new Dictionary().addNouns('boy').addAdjectives('fat', 'round');
  const ctx = new Context(dict);

  let parse = parseNounPhrase('the boy which is fat', dict);
  expect(parse).toBeTruthy();
  expect(parse).toMatchObject({
    nounPhraseFor: 0,
  })
})