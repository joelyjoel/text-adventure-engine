import { SyntacticPredicate } from "./linking/SyntacticPredicate";

export interface Syntax {
  regex():RegExp;
  str(args:string[]):string;
  parse(str:string): {args:(string|number)[], syntax:Syntax}|null;
  
  readonly numberOfArgs: number;
  predicate?: SyntacticPredicate;
}