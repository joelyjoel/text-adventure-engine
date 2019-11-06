import { Syntax } from "./Syntax";
import { or } from "regops";

export class SyntaxSet implements Syntax {
  syntaxs: Syntax[];

  constructor(...syntaxs:Syntax[]) {
    if(syntaxs.some(syntax => syntax.numberOfArgs != syntaxs[0].numberOfArgs))
      throw "Syntax set with inconsistent numbers of arguments.";

    this.syntaxs = syntaxs.slice();    
  }

  get numberOfArgs() {
    return this.syntaxs[0].numberOfArgs;
  }

  regex() {
    return or(...this.syntaxs.map(syntax => syntax.regex()))
  }

  parse(str:string) {
    for(let syntax of this.syntaxs) {
      let parse = syntax.parse(str)
      if(parse)
        return parse;
    }

    // Otherwise,
    return null;
  }

  str(args:string[]) {
    return this.randomSyntax().str(args);
  }

  randomSyntax() {
    return this.syntaxs[Math.floor(Math.random() * this.syntaxs.length)];
  }
}