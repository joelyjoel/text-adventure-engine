import { Sentence } from "../logic";
import { isPredicateSyntaxWithTense } from "../linking/SyntaxLogicLinkingMatrix";
import { composeEntity } from "./composeEntity";
import { PredicateSyntax } from "../PredicateSyntax";
import { Tense } from "../util/tense";

export function composeStatement(
  statement:{sentence:Sentence; truth:string}, 
  ctx:any
) {
  let syntaxs = ctx.linkingMatrix.meaningToSyntaxs({
    predicate: statement.sentence.predicate,
    truth: statement.truth
  }).filter(syntax => isPredicateSyntaxWithTense(syntax))

  if(syntaxs.length == 0)
    return null

  // Choose a syntax at random.
  let syntax = syntaxs[Math.floor(Math.random()*syntaxs.length)]
  let args = statement.sentence.args.map(arg => composeEntity(arg, ctx))
  
  if(isPredicateSyntaxWithTense(syntax))
    return syntax.syntax.str(args, {tense: syntax.tense})
  else {
    console.log(syntax)
    throw "Something went wrong filtering the syntaxs";
  }
}
