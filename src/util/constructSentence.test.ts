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