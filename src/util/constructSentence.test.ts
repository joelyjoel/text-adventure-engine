import { constructSentence, addConjugator } from "./constructSentence"

test('Constructing sentences', () => {
  expect(constructSentence(
    'take',
    'simple_present',
    'Polly',
    'her grandma',
    {to: 'the shops'}
  )).toBe('Polly takes her grandma to the shops')
})

test('Adding conjugator', () => {
  expect(addConjugator('take')).toBe('<take')
})