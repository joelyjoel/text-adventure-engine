import { Sentence } from "./Sentence";
import { Entity } from "./Entity";

export class TruthTable {
  defaultTruthValue: string;
  sentenceIndex: {[key:string]: {sentence:Sentence, truth:string}};
  /** For redirecting identical entities to their main entity. */
  private identityMap: {[symbol:string]:Entity};

  constructor() {
    this.defaultTruthValue = 'false';
    this.sentenceIndex = {};
    this.identityMap = {};
  }

  /** Assign a truth value to a sentence */
  assign(sentence:Sentence, truth:string) {
    sentence = this.idMapSentence(sentence);
    let symbol = sentence.symbol;
    if(this.sentenceIndex[symbol])
      this.sentenceIndex[symbol].truth = truth;
    else
      this.sentenceIndex[symbol] = {sentence, truth}
  }

  /** Remove a truth assignment from the table */
  remove(sentence: Sentence) {
    sentence = this.idMapSentence(sentence)

    let symbol = sentence.symbol;
    delete this.sentenceIndex[symbol];
  }

  /** Look up the truth value of a sentence */
  lookUp(sentence:Sentence) {
    sentence = this.idMapSentence(sentence);

    let symbol = sentence.symbol;
    if(this.sentenceIndex[symbol])
      return this.sentenceIndex[symbol].truth;
    else
      return this.defaultTruthValue;
  }

  /** Get a list of all truth-assignments in the table */
  get facts() {
    return Object.values(this.sentenceIndex);
  }

  /** Generate a symbollic string version of the table. */
  get symbol() {
    return '{' +
      this.facts
        .map(({sentence, truth}) => sentence.symbol + '=' + truth)
        .join(';') 
      + '}'
  }

  /** Count the number of truth-assignments in the table. */
  get length() : number {
    return this.facts.length;
  }

  /** Get a list of all unique entities involved in the table. */
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

  /** Declare an entity identical to another. */
  makeIdentical(
    mainEntity:Entity, 
    duplicate:Entity, 
    /** Should the identity be added to the identity map? Set to `false` if the duplicate entity will never be reused. */
    addToMap=true
  ) {
    while(this.identityMap[mainEntity.symbol])
      mainEntity = this.identityMap[mainEntity.symbol];

    for(let symbol in this.sentenceIndex) {
      let {sentence} = this.sentenceIndex[symbol];
      let originalSymbol = sentence.symbol;
      for(let i in sentence.args)
        if(sentence.args[i] == duplicate)
          sentence.args[i] = mainEntity;

      // If the arguments have been changes, change the sentence's key in `sentenceIndex` 
      let newSymbol = sentence.symbol;
      if(newSymbol!= originalSymbol) {
        this.sentenceIndex[newSymbol] = this.sentenceIndex[originalSymbol]
        delete this.sentenceIndex[originalSymbol];
      }

    }

    // Add an entry to the identity map so that both entities can be used interchangeably in future
    if(addToMap)
      this.identityMap[duplicate.symbol] = mainEntity;
  }

  /** Convert any duplicate arguments into the main entity of the identity group */
  idMapSentence({predicate, args}: Sentence) {
    return new Sentence(predicate, ...args.map(arg => {
      if(arg instanceof Entity) {
        while(this.identityMap[arg.symbol])
          arg = this.identityMap[arg.symbol];
        return arg;
      } else
        return arg;
    }))
  }
}