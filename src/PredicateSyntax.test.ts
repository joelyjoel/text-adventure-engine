import { PredicateSyntax } from "./PredicateSyntax"
import { wholeWord } from "./util/regops.extended";

test('Constructing a predicate syntax', () => {
  const syntax = new PredicateSyntax('go', ['subject', 'to']);
  expect(syntax).toBeTruthy();
  expect(syntax.verbRegex.source)
    .toBe(wholeWord('goes|go').source);
  expect(syntax.prepositions).toStrictEqual(['to']);
  expect(syntax.prepositionRegex.source)
  .toBe(wholeWord('to').source);
})

test('Parsing using a PredicateSyntax', () => {
  const syntax = new PredicateSyntax('live', ['subject', 'in'])
  let parse = syntax.parse('the boy lives in the dutch barge');

  expect(parse).toStrictEqual({
    args: ['the boy', 'the dutch barge'],
    syntax: syntax,
  })
})
