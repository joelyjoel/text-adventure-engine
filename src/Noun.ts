
import { toSnakeCase } from "./util/toCamelCase";
import { PredicateSyntax } from "./PredicateSyntax";

export class Noun {
  str: string;
  phrasal: boolean;
  readonly symbol: string;
  predicateSyntax: PredicateSyntax;
  numberOfArgs: 1;

  constructor(str:string) {
    this.str = str;
    this.phrasal = /\s/.test(str);

    this.predicateSyntax = new PredicateSyntax(`be a ${str}`, ['subject']);

    this.symbol = toSnakeCase(str);
    this.numberOfArgs = 1;
  }

  get lastWord() {
    return this.str.slice(this.str.lastIndexOf(' ') + 1);
  }
}