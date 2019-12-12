import { Predicate } from "../logic";
import { StatementSyntax } from "../parsing/parseStatement";

export class LPredicate extends Predicate {
  syntaxs: StatementSyntax[];

  constructor(syntaxs:StatementSyntax[], symbol?:string) {
    let numberOfArgs = syntaxs[0].numberOfArgs;
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