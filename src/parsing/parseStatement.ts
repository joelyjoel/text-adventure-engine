import { Context } from "../Context";
import { Dictionary } from "../Dictionary";
import { Parse } from "./Parse";
import { Template } from "../Template";
import { parseNounPhrase, NounPhraseParse } from "./parseNounPhrase";
import { PredicateSyntax } from "../PredicateSyntax";
import { Tense, allTenses } from "../util/tense";
import { getPossibleTenses } from "../util/detectTense";

export interface StatementParse extends Parse {
  args: (string|NounPhraseParse|number)[];
  syntax: StatementSyntax
  syntaxKind: 'template' | 'predicate'
  pos: 'statement'|'question';
  tense: Tense;
  question: boolean;
  negative: 'not' | false;
};

/** Classes that can be used to parse NLP statements. 
 * e.g. "The cat is in the room".
*/
export type StatementSyntax = (Template | PredicateSyntax);

export function * shallowParseStatement(str:string, ctx:Context|Dictionary):Generator<StatementParse> {
  if(ctx instanceof Dictionary)
    ctx = new Context(ctx);

  const {dictionary} = ctx;

  const tenses = allTenses;//getPossibleTenses(str);
  const asQuestion = true;
  const asNegative = true;
  
  for(let syntax of dictionary.statementSyntaxs) {
    if(syntax instanceof PredicateSyntax) {
      // Skip if it doesn't fit the quick check.
      if(!syntax.quickCheck(str))
        continue;

      let parses = syntax.parse(str, {
        tenses, asQuestion, asNegative, 
        asNounPhrase: false
      })

      for(let parse of parses)
        yield {
          ...parse,
          pos: parse.question ? 'question' : 'statement',
          from: 0,
          to: str.length,
          syntaxKind: 'predicate',
          str,
        };

    } else if(syntax instanceof Template) {
      let parse = syntax.parse(str);
      if(parse)
        yield {
          ...parse,
          from: 0,
          to: str.length,
          syntaxKind: 'template',
          str,
        };
    }
  }
}

/** Parse a statement (including noun-phrase arguments). */
export function * parseStatement(str:string, ctx:Context):Generator<StatementParse> {
  for(const parse of shallowParseStatement(str, ctx)) {
    const {args, syntax, syntaxKind, tense, question, negative, pos} = parse
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
          pos, tense, question, negative,
          from: 0,
          to: str.length,
          str
        }
    } else
      throw "Unrecognised syntaxKind: " + syntaxKind;
  }
}