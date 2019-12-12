import { Predicate } from "./Predicate";
import { Entity } from "./Entity";

export class Sentence {
  readonly predicate: Predicate;
  readonly args: Entity[];

  constructor(predicate:Predicate, ...args:Entity[]) {
    if(predicate.numberOfArgs != args.length)
      throw `Predicate, ${predicate.symbol}, expects ${predicate.numberOfArgs} arguments.`;

    this.predicate = predicate;
    this.args = args;
  }

  involves(e:Entity) {
    return this.args.includes(e);
  }

  get symbol() {
    return this.predicate.symbol 
      + '(' + this.args.map(e => e.symbol).join(',') + ')';
  }

  get predicateSymbol() {
    return this.predicate.symbol;
  }

  get argsSymbol(){
    return this.args.map(arg=>arg.symbol).join(',')
  }
}