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

  expect(parse).toStrictEqual({
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

  let str = syntax.str(['the moose', 'this hoose'], 'simple_question');

  expect(str).toBe('does the moose live in this hoose')
})

test('Parsing questions using PredicateSyntax', () => {
  const syntax = new PredicateSyntax('live', ['subject', 'in']);

  console.log(syntax.questionRegex)

  let parse = syntax.parse(
    'does a moose live in this hoose', 'simple_question'
  );

  expect(parse).toBeTruthy()
})

/*test('Parsing using an unary PredicateSyntax', () => {
  const syntax = new PredicateSyntax('float', ['subject'])
  syntax.parse('the boat floats')
  console.log(syntax)
  expect(syntax).toMatchObject({
    args: ['the boat']
  })
})*/