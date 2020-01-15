import { Noun } from "./Noun";
import { EntitySyntax } from "./EntitySyntax";
import { Adjective } from "./Adjective";

test('EntitySyntax', () => {

  expect(
    new EntitySyntax([new Noun('ball')]).compose()
  ).toBe('the ball')

  expect(
    new EntitySyntax(['Clive']).compose({useProperNoun: true})
  ).toBe('Clive')

  expect(
    new EntitySyntax([new Adjective('oblongular')]).compose({numberOfAdjectives:1})
  ).toBe('the oblongular thing')

  expect(
    new EntitySyntax([new Adjective('oblongular')], {plural:true}).compose({numberOfAdjectives:1})
  ).toBe('the oblongular things')

  expect(
    new EntitySyntax([new Adjective('oblongular')], {plural:true})
      .compose({indefinite: true, numberOfAdjectives:1})
  ).toBe('some oblongular things')
})