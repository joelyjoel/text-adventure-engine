import { Template } from "./Template"

test('Template test 1', () => {
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