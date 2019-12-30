import { AdjectivePredicate } from "./linking/AdjectivePredicate";
import { toSnakeCase } from "./util/toCamelCase";
import { PredicateSyntax } from "./PredicateSyntax";

/** Class for storing an adjecitve inside a `Dictionary` object. */
export class Adjective {
  str: string;
  phrasal: boolean;
  readonly symbol: string;
  predicateSyntax: PredicateSyntax;

  constructor(str:string) {
    this.str = str;
    this.phrasal = /\s/.test(str);

    this.predicateSyntax = new PredicateSyntax(`be ${str}`, ['subject']);
    
    this.symbol = toSnakeCase(this.str);
  }

  get lastWord() {
    return this.str.slice(this.str.lastIndexOf(' ') + 1);
  }
}