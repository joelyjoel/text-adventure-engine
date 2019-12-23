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

  expect(compose({
    infinitive: 'play',
    subject: 'you',
    tense: 'simple_past'
  })).toBe('you played')

  expect(compose({
    infinitive: 'play',
    subject: 'I',
    tense: 'simple_past'
  })).toBe('I played')

  expect(compose({
    infinitive: 'play',
    subject: 'he',
    tense: 'simple_past'
  })).toBe('he played')

  expect(compose({
    infinitive: 'play',
    subject: 'she',
    tense: 'simple_past'
  })).toBe('she played')
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

  expect(compose({
    infinitive: 'play',
    subject: 'he',
    tense: 'simple_past',
    question: true,
  })).toBe('did he play')
})

test('Composing noun phrase sentences', () => {
  // NP for subject
  expect(compose({
    infinitive: 'be aloose',
    subject:'a moose',
    aboot: 'this hoose',
    nounPhraseFor: 'subject'
  })).toBe('a moose which is aloose aboot this hoose')

  // NP for object
  expect(compose({
    infinitive: 'nibble',
    subject: 'the moose',
    object: 'my curtains',
    in: 'the living room',
    nounPhraseFor: 'object',
  })).toBe('my curtains which the moose nibbles in the living room')

  // NP for prepositions
  expect(compose({
    infinitive: 'be aloose',
    subject:'a moose',
    aboot: 'this hoose',
    nounPhraseFor: 'aboot',
  })).toBe('this hoose aboot which a moose is aloose')

  expect(compose({
    infinitive: 'be aloose',
    subject:'a moose',
    aboot: 'this hoose',
    tense: 'simple_past',
    nounPhraseFor: 'aboot',
  })).toBe('this hoose aboot which a moose was aloose')

  // Negatives
  expect(compose({
    infinitive: 'be aloose',
    subject: 'a moose',
    aboot: 'this hoose',
    tense: 'simple_present',
    nounPhraseFor: 'aboot',
    negative: 'not'
  })).toBe('this hoose aboot which a moose is not aloose')
})