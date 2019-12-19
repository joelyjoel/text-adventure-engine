import {sentenceFormSymbol} from './sentenceFormSymbol'

test('sentenceFormSymbol', () => {
  expect(sentenceFormSymbol({
    tense: 'simple_present',
    negative: false,
    question: false,
    nounPhraseFor: null
  })).toBe('simple_present')

  expect(sentenceFormSymbol({
    tense: 'future_continuous',
    negative: 'not',
    question: true,
    nounPhraseFor: null
  })).toBe('!future_continuous?')

  expect(sentenceFormSymbol({
    tense: 'present_perfect_continuous',
    negative:false,
    question: false,
    nounPhraseFor: 'in'
  })).toBe('present_perfect_continuous:in')
})