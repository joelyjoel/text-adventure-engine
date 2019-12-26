import { getFirstWord } from "./getFirstWord"
import { getAuxiliaryVerb } from "./getAuxiliaryVerb"
import { isPastParticiple } from "./isPastParticiple"
import { toPlural } from "./plural"
import { toPossessiveAdjective } from "./toPossessiveAdjective"

test('getFirstWord', () => {
  expect(getFirstWord("A great festive day out this christmas"))
    .toBe("A")
  expect(getFirstWord("That's what she said"))
    .toBe("That's")
})

test("getAuxilliaryVerb", () => {
  expect(getAuxiliaryVerb("have"))
    .toStrictEqual({aux:'have', remainder:null});

  expect(getAuxiliaryVerb('play'))
    .toStrictEqual({aux:'do', remainder:'play'});
})

test('isPastParticiple', () => {
  expect(isPastParticiple('help')).toBe(false);
  expect(isPastParticiple('helped')).toBe(true);
  expect(isPastParticiple('lay')).toBe(true)
})

test('toPlural', () => {
  expect(toPlural('fish')).toBe('fish');
  expect(toPlural('cow')).toBe('cows')
})

test('toPossessiveAdjective', () => {
  let qa:{[key:string]:string} = {
    I: 'my', i: 'my', my: 'my',me: 'my', Me:'my',My:'my',
    you: 'your', your: 'your',
    he: 'his', him: 'his', his:'his',
    she: 'her', her: 'her',
    we: 'our', us:'our', our:'our',
    they: 'their', them:'their', their:'their',
  }

  for(let q in qa) {
    let a = qa[q];
    let A = toPossessiveAdjective(q);
    expect(`${q} -> ${A}`).toBe(`${q} -> ${a}`);
  }
})