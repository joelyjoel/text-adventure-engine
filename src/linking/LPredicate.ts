import { Predicate } from "../logic";
import { StatementSyntax } from "../parsing/parseStatement";
import { Dictionary } from "../Dictionary";
import { PredicateSyntax } from "../PredicateSyntax";

/** Predicate linked to linguistic features (syntax objects). */
export class LPredicate extends Predicate {
  syntaxs: StatementSyntax[];
  dictionary?:Dictionary

  constructor(syntaxs:StatementSyntax[], symbol?:string) {
    let mainSyntax = syntaxs[0]
    let numberOfArgs = mainSyntax.numberOfArgs;

    if(!symbol && mainSyntax instanceof PredicateSyntax)
      symbol = `${Predicate.getNextSymbol()}_${mainSyntax.name}`;
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