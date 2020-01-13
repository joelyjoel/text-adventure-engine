import { verbToTense, allTenses, toCoarseTense } from "./tense"

test('verbToTense', () => {
  expect(verbToTense('walk home', 'simple_present')).toBe('walk home')
  
  expect(verbToTense('walk home', 'present_continuous'))
  .toBe('be walking home')

  expect(verbToTense('live in china', 'simple_past'))
  .toBe('lived in china');

  expect(verbToTense('read', 'past_continuous'))
  .toBe('were reading')

  expect(verbToTense('live here', 'present_perfect'))
  .toBe('have lived here')

  expect(verbToTense('live here', 'present_perfect_continuous'))
  .toBe('have been living here')

  expect(verbToTense('watch her', 'past_perfect_continuous'))
  .toBe('had been watching her')

  expect(verbToTense('arrive in the states', 'future_perfect'))
  .toBe('will have arrived in the states')

  expect(verbToTense('study for five years', 'future_perfect_continuous'))
  .toBe('will have been studying for five years');

  expect(verbToTense('go to Italy', 'simple_future'))
  .toBe('will go to Italy')

  expect(verbToTense('travel by train', 'future_continuous'))
  .toBe('will be travelling by train')
});

test('toCoarseTense', () => {
  for(let tense of allTenses)
    expect(toCoarseTense(tense)).toBeTruthy();
})