import { SyntaxLogicLinkingMatrix } from "../linking/SyntaxLogicLinkingMatrix"
import { Noun } from "../Noun"
import { Adjective } from "../Adjective"
import { Context } from "../Context"
import { interpretNounPhrase } from "../interpretation/interpretNounPhrase"
import { composeEntity } from "./composeEntity"
import { TruthTable } from "../logic"

test('composeEntity', () => {
  // Set up the situation.
  let linkingMatrix = new SyntaxLogicLinkingMatrix()
    .add(new Noun('box'))
    .add(new Adjective('green'))

  let table = new TruthTable()
  let ctx = new Context(linkingMatrix, table);

  let interpretation = interpretNounPhrase('the green box', ctx);
  if(interpretation) {
    if(interpretation.table)
      table.merge(interpretation.table)
    let e = interpretation.returns;

    let str = composeEntity(e, ctx, {numberOfAdjectives: 1});
    expect(str).toBe('the green box')
    console.log(str);

    console.log(
      composeEntity(e, ctx, {numberOfEmbeddedSentences:1})
    )
  } else
    fail();
})
