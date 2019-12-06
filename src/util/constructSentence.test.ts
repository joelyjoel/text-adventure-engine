import { constructSentence, addConjugator } from "./constructSentence"

test('Constructing sentences', () => {
  expect(constructSentence({
    infinitive: 'take',
    tense: 'simple_present',
    subject: 'Polly',
    object: 'her grandma',
    to: 'the shops'
  })).toBe('Polly takes her grandma to the shops')
})

test('Adding conjugator', () => {
  expect(addConjugator('take')).toBe('<take')
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