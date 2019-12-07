import { Context } from "../Context";
import { Dictionary } from "../Dictionary";
import { Parse } from "./Parse";
import { Template } from "../Template";
import { parseNounPhrase, NounPhraseParse } from "./parseNounPhrase";
import { PredicateSyntax } from "../PredicateSyntax";

export interface StatementParse extends Parse {
  args: (string|NounPhraseParse|number)[];
  syntax: StatementSyntax
  syntaxKind: 'template'; // add more
  pos: 'statement';
};

/** Classes that can be used to parse NLP statements. 
 * e.g. "The cat is in the room".
*/
export type StatementSyntax = (Template | PredicateSyntax);

export function * shallowParseStatement(str:string, ctx:Context|Dictionary) {
  if(ctx instanceof Dictionary)
    ctx = new Context(ctx);

  const {dictionary} = ctx;
  
  for(let syntax of dictionary.statementSyntaxs) {
    let parse = syntax.parse(str, "simple_present");
    if(parse) {
      if(syntax instanceof Template)
        yield {
          args: parse.args,
          syntax,
          syntaxKind: 'template',
          pos: 'statement',
          from: 0,
          to: str.length,
          str
        };
      else if (syntax instanceof PredicateSyntax)
        yield {
          args: parse.args,
          syntax,
          syntaxKind: 'predicate',
          pos: 'statement',
          from: 0,
          to: str.length,
          str,
        }
    }
  }
}

/** Parse a statement (including noun-phrase arguments). */
export function * parseStatement(str:string, ctx:Context) {
  for(const {args, syntax, syntaxKind} of shallowParseStatement(str, ctx)) {
    if(syntaxKind == 'template' || syntaxKind == 'predicate') {
      const parsedArgs = args.map((arg, i) => {
        if(syntax.params[i].entity) {
          return parseNounPhrase(arg as string, ctx.dictionary)
        } else
          return arg;
      })

      if(parsedArgs.every(arg => arg))
        yield {
          args: parsedArgs as (string|number|NounPhraseParse)[],
          syntax,
          syntaxKind,
          pos: 'statement',
          from: 0,
          to: str.length,
          str
        } as StatementParse
    } else
      throw "Unrecognised syntaxKind: " + syntaxKind;
  }
}