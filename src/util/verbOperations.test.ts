import { gerundify, participly, pastify } from "./verbOperations"

test('Gerundify', () => {
  expect( gerundify('be') ).toBe( 'being' )
  expect( gerundify('be strong') ).toBe('being strong')
})

test('Participly', () => {
  expect(participly('be')).toBe('been')
  expect(participly('be strong')).toBe('been strong')
})

test('pastify', () => {
  expect(pastify('be')).toBe('were');
  expect(pastify('become stronger')).toBe('became stronger')
})