import { constructSentence, addConjugator, makeNegative } from "./constructSentence"

test('Constructing sentences', () => {
  expect(constructSentence({
    infinitive: 'take',
    tense: 'simple_present',
    subject: 'Polly',
    object: 'her grandma',
    to: 'the shops'
  })).toBe('Polly takes her grandma to the shops')

  expect(constructSentence({
    infinitive: 'be',
    subject: 'I',
    object: 'amazing',
    tense: 'simple_present'
  })).toBe('I am amazing');
})

test('Adding conjugator', () => {
  expect(addConjugator('take')).toBe('<take')
  expect(addConjugator('take part')).toBe('<take part')
  expect(addConjugator('be not amazing')).toBe('<be not amazing')
})

test('Constructing questions', () => {

  expect(constructSentence({
    infinitive: 'be amazing',
    subject: 'I',
    tense: 'simple_question'
  })).toBe('am I amazing');

  expect(constructSentence({
    infinitive: 'be amazing',
    subject: 'you',
    tense: 'simple_question'
  })).toBe('are you amazing');

  expect(constructSentence({
    infinitive: 'take',
    tense: 'simple_question',
    subject: 'Polly',
    object: 'her grandma',
    to: 'the shops'
  }))
  .toBe('does Polly take her grandma to the shops')
}) 

test('Negatives', () => {
  expect(makeNegative('play')).toBe('do not play');
  expect(makeNegative('have played')).toBe('have not played');
  expect(makeNegative('be amazing')).toBe('be not amazing')
  expect(makeNegative('might not be amazing')).toBe('might not not be amazing')
  expect(makeNegative('be')).toBe('be not');
  expect(
    constructSentence({
      infinitive: makeNegative('be'),
      subject: 'polly',
      object:'amazing',
      tense: 'simple_present',
    })
  ).toBe('polly is not amazing')

  expect(
    constructSentence({
      infinitive: makeNegative('be'),
      subject: 'polly',
      object:'amazing',
      tense: 'simple_question',
    })
  ).toBe('is polly not amazing')
})