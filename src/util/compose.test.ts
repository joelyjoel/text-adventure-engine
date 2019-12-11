import { compose } from "./compose";

test('Composing sentences', () => {
  expect(compose({
    infinitive: 'take',
    tense: 'simple_present',
    subject: 'Polly',
    object: 'her grandma',
    to: 'the shops'
  })).toBe('Polly takes her grandma to the shops')

  expect(compose({
    infinitive: 'be',
    subject: 'I',
    object: 'amazing',
    tense: 'simple_present'
  })).toBe('I am amazing');
})

test('Composing negatives', () => {
  expect(compose({
    infinitive: 'take',
    tense: 'simple_present',
    subject: 'Polly',
    object: 'her grandma',
    to: 'the shops',
    negative: 'not',
  })).toBe('Polly does not take her grandma to the shops')

  expect(compose({
    infinitive: 'be',
    subject: 'I',
    object: 'amazing',
    tense: 'simple_present',
    negative: 'not',
  })).toBe('I am not amazing');
})

test('Composing questions', () => {
  expect(compose({
    infinitive: 'take',
    tense: 'simple_present',
    subject: 'Polly',
    object: 'her grandma',
    to: 'the shops',
    question: true,
  })).toBe('does Polly take her grandma to the shops')

  expect(compose({
    infinitive: 'be',
    subject: 'I',
    object: 'amazing',
    tense: 'simple_present',
    question: true,
  })).toBe('am I amazing');

  expect(compose({
    infinitive: 'take',
    tense: 'simple_present',
    subject: 'Polly',
    object: 'her grandma',
    to: 'the shops',
    negative: 'not',
    question: true,
  })).toBe('does Polly not take her grandma to the shops')

  expect(compose({
    infinitive: 'be',
    subject: 'I',
    object: 'amazing',
    tense: 'simple_present',
    negative: 'not',
    question: true,
  })).toBe('am I not amazing');
})