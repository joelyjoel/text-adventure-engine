import { Sentence } from "./Sentence";
import { Entity } from "./Entity";
import { Predicate } from "./Predicate";

type TruthAssignment = {sentence:Sentence, truth:string};

const INDIFFERENT = '?'

/** A collection of sentences with corresponding truth assignments */
export class TruthTable {
  defaultTruthValue: string;
  private index: {
    [predicate_symbol:string]: {
      [argsSymbol:string]: {sentence:Sentence, truth:string}
    };
  };
  /** For redirecting identical entities to their main entity. */
  private identityMap: {[symbol:string]:Entity};

  constructor() {
    this.defaultTruthValue = INDIFFERENT;
    this.index = {};
    this.identityMap = {};
  }

  /** Assign a truth value to a sentence */
  assign(sentence:Sentence, truth:string):this {
    sentence = this.idMapSentence(sentence);

    const {predicateSymbol, argsSymbol} = sentence;

    if(!this.index[predicateSymbol])
      this.index[predicateSymbol] = {[argsSymbol]: {sentence, truth}};
    else {
      if(this.index[predicateSymbol][argsSymbol])
        this.index[predicateSymbol][argsSymbol].truth = truth;
      else
        this.index[predicateSymbol][argsSymbol] = {sentence, truth};
    }

    return this; 
  }

  /** Remove a truth assignment from the table */
  remove(sentence: Sentence) {
    const {predicateSymbol, argsSymbol} = this.idMapSentence(sentence);
    
    if(this.index[predicateSymbol])
      delete this.index[predicateSymbol][argsSymbol];
  }

  /** Look up the truth value of a sentence */
  lookUp(sentence:Sentence) {
    const {predicateSymbol, argsSymbol} = this.idMapSentence(sentence);

    if(this.index[predicateSymbol] && this.index[predicateSymbol][argsSymbol])
      return this.index[predicateSymbol][argsSymbol].truth;
    else
      return this.defaultTruthValue;
  }

  /** Get a list of all truth-assignments in the table */
  get facts():TruthAssignment[] {
    return [...this.iterate()]
  }

  /** Iterate through every truth-assignement in the table */
  *iterate() {
    for(let i in this.index)
      for(let j in this.index[i])
        yield this.index[i][j];
  }

  /** Iterate through each truth assignment with a given predicate. */
  *byPredicate(P:Predicate) {
    let symbol = P.symbol;
    let subIndex = this.index[symbol];
    for(let i in subIndex)
      yield subIndex[i];
  }

  /** Generate a symbollic string version of the table. */
  get symbol() {
    return '{\n' +
    this.facts
      .map(({sentence, truth}) => `\t(${sentence.symbol}=${truth})`)
      .join('\t&\n') 
    + '\n}';
  }

  /** Count the number of truth-assignments in the table. */
  get length() : number {
    return this.facts.length;
  }

  /** Get a list of all unique entities involved in the table. */
  get entities() : Entity[] {
    const list:Entity[] = [];
    for(let {sentence} of this.iterate())
      for(let arg of sentence.args)
        if(!list.includes(arg))
          list.push(arg);
    
    return list;
  }

  /** Create a copy of this truth table */
  clone():TruthTable {
    // Create a new, blank table.
    let newTable = new TruthTable;

    // Loop through all entries in this table
    const facts = this.facts;
    for(let {sentence, truth} of facts) {
      newTable.assign(
        new Sentence(sentence.predicate, ...sentence.args),
        truth
      )
    }

    // Copy identity mappings over to the new table.
    Object.assign(newTable.identityMap, this.identityMap);

    return newTable;
  }

  /** Absorb another table into the table. */
  merge(...tables:TruthTable[]):this {
    for(let table of tables)
      for(let {sentence, truth} of table.iterate())
        this.assign(sentence, truth);
      
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

    for(let {sentence} of this.iterate()) {
      let originalSymbol = sentence.argsSymbol;

      for(let i in sentence.args)
        if(sentence.args[i] == duplicate)
          sentence.args[i] = mainEntity;

      // If the arguments have been changes, change the sentence's key in the index
      let newSymbol = sentence.argsSymbol;
      if(newSymbol != originalSymbol) {
        let subIndex = this.index[sentence.predicateSymbol];
        if(!subIndex)
          throw 'Indexing fault: ' + sentence.predicateSymbol;

        subIndex[newSymbol] = subIndex[originalSymbol]
        delete subIndex[originalSymbol];
      }
    }

    // Add an entry to the identity map so that both entities can be used interchangeably.
    if(addToMap)
      this.identityMap[duplicate.symbol] = mainEntity;
  }

  /** Create a new sentence, converting any duplicate arguments into the main entity of its identity group */
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

  /** Check that another table could be merged into this table without changing any existing assignements. */
  checkCompatible(table: TruthTable) {
    return table.facts.every(({sentence, truth}) => {
      let internalTruth = this.lookUp(sentence);
      return truth == internalTruth || internalTruth == '?'
    })
  }

  mergeConsequences( b:TruthTable) {
    let overlap = 0;
    let contradictions = 0;
    let introductions = 0;
    for(let {sentence, truth} of b.iterate()) {
      let truth2 = this.lookUp(sentence)
      if(truth2 == INDIFFERENT)
        ++introductions;
      else if(truth2 == truth)
        ++overlap;
      else
        ++contradictions
    }

    return {overlap, contradictions,introductions}
  }

  hasContradictionsWith(table:TruthTable) {
    const [larger, smaller] = this.length > table.length ? 
      [this, table] : [table, this]

    for(let {sentence, truth} of smaller.iterate()) {
      let truth2 = larger.lookUp(sentence)
      if(truth2 != INDIFFERENT && truth2 != truth)
        return true;
    }
    
    // otherwise
    return false;
  }
}