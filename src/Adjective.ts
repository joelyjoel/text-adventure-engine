import { AdjectivePredicate } from "./linking/AdjectivePredicate";

/** Class for storing an adjecitve inside a `Dictionary` object. */
export class Adjective {
  str: string;
  phrasal: boolean;
  predicate: AdjectivePredicate;

  constructor(str:string) {
    this.str = str;
    this.phrasal = /\s/.test(str);

    this.predicate = new AdjectivePredicate(this);
  }

  get lastWord() {
    return this.str.slice(this.str.lastIndexOf(' ') + 1);
  }
}