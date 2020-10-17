import {Sentence, Predicate, Entity, stringifySentence, stringifyArgs, isEntity} from './basics'

const INDIFFERENT = '?'

/** A collection of sentences with corresponding truth assignments */
export class TruthTable<TruthValue extends string ='T'|'F'|'?'> {
  defaultTruthValue: '?'|TruthValue;
  /** 
   * Truth assignments indexed by predicate symbol and sub-indexed by the concatenation of the argument symbols.
   */
  private index: {
    [predicate_symbol:string]: {
      [argsSymbol:string]: {sentence:Sentence, truth:TruthValue}
    };
  };
  /** For redirecting identical entities to their main entity. */
  private identityMap: {[symbol:string]:Entity};

  constructor() {
    this.defaultTruthValue = INDIFFERENT;
    this.index = {};
    this.identityMap = {};
  }

  /** 
   * Assign a truth value to a sentence 
   */
  assign(sentence:Sentence, truth:TruthValue):this {
    sentence = this.idMapSentence(sentence);

    const predicateSymbol = sentence.predicate;
    const argsSymbol = stringifyArgs(sentence);

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

  /** 
   * Assign the truth value 'T' (meaning true) to a sentence.
   * @deprecated
   */
  T(predicate:Predicate, ...args:Entity[]) {
    // @ts-ignore
    return this.assign({predicate, args}, 'T');
  }

  /** 
   * Assign the truth-value 'F' (meaning false) to a sentence.
   * @deprecated
   */
  F(predicate:Predicate, ...args:Entity[]) {
    // @ts-ignore
    return this.assign({predicate, args}, 'F');
  }

  /** Remove a truth assignment from the table */
  remove(sentence: Sentence) {
    const mapped = this.idMapSentence(sentence);
    const predicateSymbol = mapped.predicate;
    const argsSymbol = stringifyArgs(mapped);
    
    if(this.index[predicateSymbol])
      delete this.index[predicateSymbol][argsSymbol];
  }

  /** Look up the truth value of a sentence */
  lookUp(sentence:Sentence) {
    const mapped = this.idMapSentence(sentence);
    const predicateSymbol = mapped.predicate;
    const argsSymbol = stringifyArgs(mapped);

    if(this.index[predicateSymbol] && this.index[predicateSymbol][argsSymbol])
      return this.index[predicateSymbol][argsSymbol].truth;
    else
      return this.defaultTruthValue;
  }

  /** Get a list of all truth-assignments in the table */
  get facts():{sentence:Sentence, truth:TruthValue}[] {
    return [...this.iterate()]
  }

  /** Iterate through every truth-assignement in the table */
  *iterate() {
    for(let i in this.index)
      for(let j in this.index[i])
        yield this.index[i][j];
  }

  /**
   * Creates a new truth table using only the truth-assignments that pass the test implemented by the provided function.
   */
  filter(callback:(assignment:{sentence: Sentence, truth:TruthValue}) => boolean):TruthTable<TruthValue> {
    let table = new TruthTable<TruthValue>();
    for(let statement of this.iterate())
      if(callback(statement))
        table.assign(statement.sentence, statement.truth)

    return table;
  }

  *involving(e:Entity) {
    e = this.idMapEntity(e);

    // Loop through all statements in the table.
    for(let statement of this.iterate())
      // Loop through each argument.
      if(statement.sentence.args.includes(e))
        yield statement;
  }

  /** Iterate through each truth assignment with a given predicate. */
  *byPredicate(P:Predicate) {
    let subIndex = this.index[P]
    for(let i in subIndex)
      yield subIndex[i];
  }

  /** Generate a symbollic string version of the table. */
  get symbol() {
    return '{\n' +
    this.facts
      .map(({sentence, truth}) => `\t(${stringifySentence(sentence)}=${truth})`)
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
  clone():TruthTable<TruthValue> {
    // Create a new, blank table.
    let newTable = new TruthTable<TruthValue>();

    // Loop through all entries in this table
    const facts = this.facts;
    for(let {sentence, truth} of facts) {
      newTable.assign(
        {predicate: sentence.predicate, args: [...sentence.args]},
        truth
      )
    }

    // Copy identity mappings over to the new table.
    Object.assign(newTable.identityMap, this.identityMap);

    return newTable;
  }

  /** Absorb another table into the table. */
  merge(...tables:TruthTable<TruthValue>[]):this {
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
    while(this.identityMap[mainEntity])
      mainEntity = this.identityMap[mainEntity];

    for(let {sentence} of this.iterate()) {
      let originalSymbol = stringifyArgs(sentence);

      for(let i in sentence.args)
        if(sentence.args[i] == duplicate)
          sentence.args[i] = mainEntity;

      // If the arguments have been changes, change the sentence's key in the index
      let newSymbol = stringifyArgs(sentence);
      if(newSymbol != originalSymbol) {
        let subIndex = this.index[sentence.predicate];
        if(!subIndex)
          throw 'Indexing fault: ' + sentence.predicate;

        subIndex[newSymbol] = subIndex[originalSymbol]
        delete subIndex[originalSymbol];
      }
    }

    // Add an entry to the identity map so that both entities can be used interchangeably.
    if(addToMap)
      this.identityMap[duplicate] = mainEntity;
  }

  /** Create a new sentence, converting any duplicate arguments into the main entity of its identity group */
  idMapSentence({predicate, args}: Sentence) {
    return {
      predicate, 
      args: args.map(arg => {
        if(isEntity(arg)) {
          return this.idMapEntity(arg);
        } else
          return arg;
      }),
    }
  }

  idMapEntity(e:Entity):Entity {
    while(this.identityMap[e])
      e = this.identityMap[e];

    // Then finally,
    return e;
  }

  /** Check that another table could be merged into this table without changing any existing assignements. */
  checkCompatible(table: TruthTable) {
    return table.facts.every(({sentence, truth}) => {
      let internalTruth = this.lookUp(sentence);
      return truth == internalTruth || internalTruth == '?'
    })
  }

  measureCompatibility( b:TruthTable) {
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

  get predicateSymbols() {
    return Object.keys(this.index);
  }

  static merge(...tables:TruthTable[]) {
    let combined = new TruthTable;

    for(let table of tables)
      combined.merge(table);

    return combined;
  }
}
