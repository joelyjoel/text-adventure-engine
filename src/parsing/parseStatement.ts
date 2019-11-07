import { Context } from "../Context";
import { Dictionary } from "../Dictionary";
import { Parse } from "./Parse";
import { Template } from "../Template";

interface StatementParse extends Parse {
  args: any[];
  syntax: StatementSyntax
  syntaxKind: 'template'; // add more
  pos: 'statement';
};

export type StatementSyntax = (Template);

export function * shallowParseStatement(str:string, ctx:Context|Dictionary): Generator<StatementParse> {
  if(ctx instanceof Dictionary)
    ctx = new Context(ctx);

  const {dictionary} = ctx;
  
  for(let syntax of dictionary.statementSyntaxs) {
    let parse = syntax.parse(str);
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
    }
  }
}