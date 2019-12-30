import { AdjectivePredicate } from "./linking/AdjectivePredicate";
import { toSnakeCase } from "./util/toCamelCase";

/** Class for storing an adjecitve inside a `Dictionary` object. */
export class Adjective {
  str: string;
  phrasal: boolean;
  predicate: AdjectivePredicate;
  readonly symbol: string;

  constructor(str:string) {
    this.str = str;
    this.phrasal = /\s/.test(str);

    this.predicate = new AdjectivePredicate(this);
    
    this.symbol = toSnakeCase(this.str);
  }

  get lastWord() {
    return this.str.slice(this.str.lastIndexOf(' ') + 1);
  }
}