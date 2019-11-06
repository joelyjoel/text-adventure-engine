import { Predicate } from "../logic";
import { Syntax } from "../Syntax";

export class SyntacticPredicate extends Predicate {
  syntaxs: Syntax[];

  constructor(numberOfArgs:number, syntaxs:Syntax[]) {
    super(numberOfArgs);

    for(let syntax of syntaxs)
      this.addSyntax(syntax);
  }

  addSyntax(syntax:Syntax) {
    if(syntax.numberOfArgs != this.numberOfArgs)
      throw "Syntax has wrong number of arguments."
      
    syntax.predicate = this;
    this.syntaxs.push(syntax);
  }
}