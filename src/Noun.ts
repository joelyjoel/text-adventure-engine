import { NounPredicate } from "./linking/NounPredicate";

export class Noun {
  str: string;
  phrasal: boolean;
  predicate: NounPredicate

  constructor(str:string) {
    this.str = str;
    this.phrasal = /\s/.test(str);

    this.predicate = new NounPredicate(this);
  }

  get lastWord() {
    return this.str.slice(this.str.lastIndexOf(' ') + 1);
  }
}