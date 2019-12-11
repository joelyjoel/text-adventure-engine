import { PredicateSyntax } from "./PredicateSyntax"
import { wholeWord } from "./util/regops.extended";
import { allTenses } from "./util/tense";

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
    negative: false,
  })
})

test('Parsing questions & negatives using PredicateSyntax', () => {
  const syntax = new PredicateSyntax('live', ['subject', 'in']);
  let parse = syntax.parse(
    'a moose does not live in this hoose',
    {tense:'simple_present', question:false, negative:'not'}
  )

  expect(parse).toStrictEqual({
    args: ['a moose', 'this hoose'],
    syntax,
    tense: 'simple_present',
    question: false,
    negative: 'not'
  })

  const syntax2 = new PredicateSyntax('be aloose', ['subject', 'aboot'])
  expect(
    syntax2.parse(
      'will a moose not be aloose aboot this hoose',
      {tense:'simple_future', question:true, negative:'not'}
    )
  ).toMatchObject({
    args: ['a moose', 'this hoose'],
    syntax: syntax2,
    tense: 'simple_future',
    question: true,
    negative: 'not',
  })
})

test('Parsing/compose bijection', () => {
 
  const sentences = [
    {
      syntax: new PredicateSyntax('be aloose', ['subject', 'aboot']),
      args: ['a moose', 'this hoose']
    },
    {
      syntax: new PredicateSyntax('love the rain', ['subject']),
      args: ['my friend John']
    },
    {
      syntax: new PredicateSyntax('go', ['subject', 'to', 'at']),
      args: ['Kelly', 'a disco', 'new year']
    }
  ]

  
  for(let {syntax, args} of sentences)
    for(let tense of allTenses) {
      let statement = syntax.str(args, tense)
      let statementParse = syntax.parse(statement, {tense})
      expect(statementParse).toMatchObject({
        args, syntax, tense, question: false, negative: false,
      });

      let q = syntax.str(args, {tense, question:true});
      let qParse = syntax.parse(q, {tense, question:true})
      expect(qParse).toMatchObject({
        args, syntax, tense, question:true, negative: false
      })

      let n = syntax.str(args, {tense, negative: 'not'})
      let nParse = syntax.parse(n, {tense, negative: 'not'})
      expect(nParse).toMatchObject({
        args, syntax, tense, question:false, negative:'not',
      })

      let qn = syntax.str(args, {tense, negative:'not', question:true})
      let qnParse = syntax.parse(qn, {tense, negative:'not', question:true});
      expect(qnParse).toMatchObject({
        args, syntax, tense, question:true, negative:'not'
      })
    }
})