import { Predicate } from "./Predicate";
import { Entity } from "./Entity";

export class Sentence {
  predicate: Predicate;
  args: Entity[];

  constructor(predicate:Predicate, ...args:Entity[]) {
    this.predicate = predicate;
    this.args = args;
  }

  get symbol() {
    return this.predicate.symbol + '(' + this.args.map(e => e.symbol).join(',') + ')';
  }
}