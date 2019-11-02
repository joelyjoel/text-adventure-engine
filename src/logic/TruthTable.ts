import { Sentence } from "./Sentence";

export class TruthTable {
  defaultTruthValue: string;
  facts: {sentence:Sentence, truth:string}[];
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
}