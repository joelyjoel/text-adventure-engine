import { Sentence } from "./Sentence";
import { Entity } from "./Entity";

export class TruthTable {
  defaultTruthValue: string;
  sentenceIndex: {[key:string]: {sentence:Sentence, truth:string}};

  constructor() {
    this.defaultTruthValue = 'false';
    this.sentenceIndex = {};
  }

  assign(sentence:Sentence, truth:string) {
    let symbol = sentence.symbol;
    if(this.sentenceIndex[symbol])
      this.sentenceIndex[symbol].truth = truth;
    else
      this.sentenceIndex[symbol] = {sentence, truth}
  }

  lookUp(sentence:Sentence) {
    let symbol = sentence.symbol;
    if(this.sentenceIndex[symbol])
      return this.sentenceIndex[symbol].truth;
    else
      return this.defaultTruthValue;
  }

  get facts() {
    return Object.values(this.sentenceIndex);
  }

  get symbol() {
    return '{' +
      this.facts
        .map(({sentence, truth}) => sentence.symbol + '=' + truth)
        .join(';') 
      + '}'
  }

  /** Count the number of entries in the table. */
  get length() : number {
    return this.facts.length;
  }

  get entities() : Entity[] {
    const list:Entity[] = [];
    for(let key in this.sentenceIndex) {
      for(let arg of this.sentenceIndex[key].sentence.args)
        if(!list.includes(arg))
          list.push(arg);
    }

    return list;
  }

  /** Absorb another table into the table */
  merge(...tables:TruthTable[]) {
    for(let table of tables)
      for(let symbol in table.sentenceIndex) {
        let {sentence, truth} = table.sentenceIndex[symbol];
        this.assign(sentence, truth);
      }
      
    // Chainable
    return this
  }
}