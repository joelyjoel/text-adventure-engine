import { PredicateSyntax } from "./PredicateSyntax"
import { wholeWord } from "./util/regops.extended";

test('Constructing a predicate syntax', () => {
  const syntax = new PredicateSyntax('go', ['subject', 'to']);
  expect(syntax).toBeTruthy();
  expect(syntax.verbRegex.source)
    .toBe(wholeWord('goes|go').source);
  expect(syntax.prepositions).toStrictEqual(['to']);
  if(!syntax.prepositionRegex)
    fail();
  else
    expect(syntax.prepositionRegex.source)
    .toBe(wholeWord('to').source);
})

test('Parsing using a PredicateSyntax', () => {
  const syntax = new PredicateSyntax('live', ['subject', 'in'])
  let parse = syntax.parse('the boy lives in the dutch barge', 'simple_present');

  expect(parse).toMatchObject({
    args: ['the boy', 'the dutch barge'],
    syntax: syntax,
    tense: 'simple_present'
  })
})

test('Constructing sentences using PredicateSyntax', () => {
  const syntax = new PredicateSyntax('live', ['subject', 'in']);

  let str = syntax.str(['the boy', 'a warm dutch barge']);

  expect(str).toBe('the boy lives in a warm dutch barge');
})

test('Composing questions using PredicateSyntax', () => {
  const syntax = new PredicateSyntax('live', ['subject', 'in']);

  let str = syntax.str(
    ['the moose', 'this hoose'], 
    {tense: 'simple_present', question:true}
  );

  expect(str).toBe('does the moose live in this hoose')
})

test('Parsing questions using PredicateSyntax', () => {
  const syntax = new PredicateSyntax('live', ['subject', 'in']);
  let parse = syntax.parse(
    'does a moose live in this hoose', {tense: 'simple_present', question:true}
  );
  expect(parse).toBeTruthy()
  expect(parse).toMatchObject({
    args: ['a moose', 'this hoose'],
    syntax,
    tense: 'simple_present',
    question:true,
  })

  const syntax2 = new PredicateSyntax('be aloose', ['subject', 'aboot'])
  expect(syntax2.parse(
    'is a moose aloose aboot this hoose',
    {tense: 'simple_present', question:true}
  )).toMatchObject({
    args: ['a moose', 'this hoose'],
    syntax: syntax2,
    tense: 'simple_present',
    question: true,
  })
})
