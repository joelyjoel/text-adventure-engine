import { PredicateSyntax } from "./PredicateSyntax"
import { wholeWord } from "./util/regops.extended";
import { allTenses } from "./util/tense";
import { sentenceFormSymbol } from "./util/sentenceFormSymbol";

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
  let parse = syntax.parseSpecific('the boy lives in the dutch barge', 'simple_present');

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
  let parse = syntax.parseSpecific(
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
  expect(syntax2.parseSpecific(
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
  let parse = syntax.parseSpecific(
    'a moose does not live in this hoose',
    {tense:'simple_present', question:false, negative:'not'}
  )

  expect(parse).toMatchObject({
    args: ['a moose', 'this hoose'],
    syntax,
    tense: 'simple_present',
    question: false,
    negative: 'not'
  })

  const syntax2 = new PredicateSyntax('be aloose', ['subject', 'aboot'])
  expect(
    syntax2.parseSpecific(
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
      if(!syntax.quickCheck(statement))
        console.log('Quick check failed:', statement, syntax.quickCheckRegex, `tense: ${tense};`)
      expect(syntax.quickCheck(statement)).toBe(true);
      let statementParse = syntax.parseSpecific(statement, {tense})
      expect(statementParse).toMatchObject({
        args, syntax, tense, question: false, negative: false,
      });

      let q = syntax.str(args, {tense, question:true});
      expect(syntax.quickCheck(q)).toBe(true);
      let qParse = syntax.parseSpecific(q, {tense, question:true})
      if(!qParse) {
        console.log(`${tense}: ${q}`)
        console.log(syntax.composeVerbPhraseRegex({tense, question:true}))
        fail(`Couldn't parse '${q}'`)
      }
      expect(qParse).toMatchObject({
        args, syntax, tense, question:true, negative: false
      })

      let n = syntax.str(args, {tense, negative: 'not'})
      expect(syntax.quickCheck(n)).toBe(true);
      let nParse = syntax.parseSpecific(n, {tense, negative: 'not'})
      expect(nParse).toMatchObject({
        args, syntax, tense, question:false, negative:'not',
      })

      let qn = syntax.str(args, {tense, negative:'not', question:true})
      expect(syntax.quickCheck(qn)).toBe(true);
      let qnParse = syntax.parseSpecific(qn, {tense, negative:'not', question:true});
      if(!qnParse) {
        console.log(`${tense}: ${qn}`)
        console.log(syntax.composeVerbPhraseRegex({tense, question: true, negative:'not'}))
        fail(`Could not parse: "${qn}"`)
      }
      expect(qnParse).toMatchObject({
        args, syntax, tense, question:true, negative:'not'
      })

      for(let param of syntax.params) {
        // Noun phrase form
        let nounPhraseFor = param.name;
        let np = syntax.str(args, {tense, nounPhraseFor});
        expect(syntax.quickCheck(np)).toBe(true);
        let npParse = syntax.parseSpecific(np, {tense, nounPhraseFor});
        if(!npParse)
          console.log(
            `String to parse: "${np}"`,
            'regex:', syntax.composeVerbPhraseRegex({
              tense, question:false, negative: false, nounPhraseFor
          }))
        expect(npParse).toMatchObject({
          args, syntax, tense, question: false, negative: false, nounPhraseFor
        })

        // Noun phrase negative form
        let npn = syntax.str(args, {tense, nounPhraseFor, negative:'not'});
        expect(syntax.quickCheck(npn)).toBe(true);
        let npnParse = syntax.parseSpecific(npn, {tense, nounPhraseFor, negative:'not'});
        if(!npnParse) {
          console.log(
            `String to parse: "${npn}"`,
            'regex:', syntax.composeVerbPhraseRegex({
              tense, question:false, negative: 'not', nounPhraseFor
          }))
          fail(`${syntax.name} failed to parse: "${npn}"`)
        }
        expect(npnParse).toMatchObject({
          args, syntax, tense, question: false, negative: 'not', nounPhraseFor
        })
      }
    }
})

test('Parsing noun phrase sentences', () => {
  let syntax = new PredicateSyntax('be aloose', ['subject', 'aboot']);

  expect(
    syntax.parseSpecific('the moose which is aloose aboot this hoose', {
      tense: 'simple_present',
      nounPhraseFor: 'subject'
    })
  )
  .toMatchObject({
    tense: 'simple_present',
    args: ['the moose', 'this hoose'],
  })

  expect(
    syntax.parseSpecific('this hoose aboot which the moose is aloose', {
      tense: 'simple_present',
      nounPhraseFor: 'aboot'
    })
  )
  .toMatchObject({
    tense: 'simple_present',
    args: ['the moose', 'this hoose'],
  })
})

test('PredicateSyntax: Re-using indexed regular expressions', () => {
  let syntax = new PredicateSyntax('be aloose', ['subject', 'aboot']);
  
  let reg1 = syntax.composeVerbPhraseRegex({tense: 'simple_present', negative:'not', question: true, nounPhraseFor:null})
  let reg2 = syntax.composeVerbPhraseRegex({tense: 'simple_present', negative:'not', question: true, nounPhraseFor:null})

  expect(reg1).toBe(reg2)
})

test('PredicateSyntax: parsing with unknown tense', () => {
  let syntax = new PredicateSyntax('be aloose', ['subject', 'aboot']);

  let [parse1] = syntax.parse('the moose is aloose aboot this hoose')
  expect(parse1).toMatchObject({tense: 'simple_present'});

  let [parse2] = syntax.parse('the hoose aboot which a moose was aloose')
  expect(parse2).toMatchObject({
    tense: 'simple_past',
    nounPhraseFor:'aboot',
  })

  let [parse3] = syntax.parse('has a moose been aloose aboot this hoose')
  expect(parse3).toMatchObject({
    tense: 'present_perfect',
    question: true,
  })
})