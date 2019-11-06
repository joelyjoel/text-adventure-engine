import { Template } from "./Template"

test('Template Test 1', () => {
  expect(
    new Template('_ hears a _')
      .str(['Horton', 'Hoo'])
  ).toBe('Horton hears a Hoo');

  expect(
    new Template('_ hears a _')
      .parse('Horton hears a Hoo')
  ).toMatchObject({
    args: ["Horton", "Hoo"],
    
  })
})

test('Template Test 2: Conjugation', () => {
  let template = new Template('_ <were in a bad mood');

  expect(
    template.str(['you'])
  ).toBe('you were in a bad mood')

  expect(
    template.str(['I'])
  ).toBe('I was in a bad mood');
})

test('Template Test 3: Parsing Conjugations', () => {
  const template = new Template('_ <were in a bad mood');

  expect(template.parse('you were in a bad mood'))
    .toMatchObject({
      args: ['you']
    })

  expect(template.parse('I was in a bad mood'))
  .toMatchObject({
    args: ['I']
  })
})