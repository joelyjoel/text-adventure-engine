
import { NounPredicate } from "./linking/NounPredicate";
import { toSnakeCase } from "./util/toCamelCase";

export class Noun {
  str: string;
  phrasal: boolean;
  predicate: NounPredicate
  readonly symbol: string;

  constructor(str:string) {
    this.str = str;
    this.phrasal = /\s/.test(str);

    this.predicate = new NounPredicate(this);

    this.symbol = toSnakeCase(str);
  }

  get lastWord() {
    return this.str.slice(this.str.lastIndexOf(' ') + 1);
  }
}