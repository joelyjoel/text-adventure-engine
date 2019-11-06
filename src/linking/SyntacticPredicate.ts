import { Predicate } from "../logic";
import { Syntax } from "../Syntax";

export class SyntacticPredicate extends Predicate {
  syntaxs: Syntax[];

  constructor(numberOfArgs:number, syntaxs:Syntax[], symbol?:string) {
    super(numberOfArgs, symbol);

    this.syntaxs = [];

    for(let syntax of syntaxs) {
      if(syntax.numberOfArgs != this.numberOfArgs)
        throw "Syntax has wrong number of arguments."
        
      syntax.predicate = this;
      this.syntaxs.push(syntax);
    }
  }
}