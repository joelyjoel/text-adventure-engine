export interface Syntax {
  regex():RegExp;
  str(args:string[]):string;
  parse(str:string): {args:(string|number)[], syntax:Syntax}|null;
}