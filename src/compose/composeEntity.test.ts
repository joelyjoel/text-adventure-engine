import { SyntaxLogicLinkingMatrix } from "../linking/SyntaxLogicLinkingMatrix"
import { Noun } from "../Noun"
import { Adjective } from "../Adjective"
import { Context } from "../Context"
import { interpretNounPhrase } from "../interpretation"
import { composeEntity } from "./composeEntity"
import { TruthTable } from "../logic"

// Skipping test because uses deprecated code
test.skip('composeEntity', async () => {
  // Set up the situation.
  let linkingMatrix = new SyntaxLogicLinkingMatrix()
    .add(new Noun('box'))
    .add(new Adjective('green'))

  let table = new TruthTable()
  let ctx = new Context(linkingMatrix, table);

  let foundMatch = false;
  for await(let interpretation of interpretNounPhrase('the green box')) {
    if(interpretation.table)
      table.merge(interpretation.table)
    let e = interpretation.returning;

    let str = composeEntity(e, ctx, {numberOfAdjectives: 1});
    if(str == 'the green box')
      foundMatch = true;
  } 

  expect(foundMatch).toBe(true);
})
