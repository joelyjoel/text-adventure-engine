import {Sentence, Predicate, Entity, stringifySentence, stringifyArgs, isEntity} from './basics'
import {quickSentence} from './parse';


export const INDIFFERENT = '?'

interface IdentityMap {
  [S: string]: Entity;
}

/** A collection of sentences with corresponding truth assignments */
export class TruthTable<TruthValue extends string ='T'|'F'|'?'> {
  defaultTruthValue: '?'|TruthValue;
  /** 
   * Truth assignments indexed by predicate symbol and sub-indexed by the concatenation of the argument symbols.
   */
  protected index: {
    [predicate_symbol:string]: {
      [argsSymbol:string]: {sentence:Sentence, truth:'?'|TruthValue}
    };
  };
  /** For redirecting identical entities to their main entity. */
  protected identityMap: IdentityMap;

  constructor() {
    this.defaultTruthValue = INDIFFERENT;
    this.index = {};
    this.identityMap = {};
  }

  /** 
   * Assign a truth value to a sentence 
   */
  assign(sentence:Sentence|string, truth:TruthValue|'?'):this {
    if(typeof sentence == 'string')
      return this.assign(quickSentence(sentence), truth);

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
  remove(sentence: Sentence|string, truth?:TruthValue):void {
    if(typeof sentence === 'string') 
      return this.remove(quickSentence(sentence));
    
    const mapped = this.idMapSentence(sentence);
    const predicate = mapped.predicate;
    const args = stringifyArgs(mapped);
    
    if(this.index[predicate]) {
      if(truth && this.index[predicate][args].truth != truth)
        throw 'Unexpected truth value when removing assignment from truth table.';
      else
        delete this.index[predicate][args];
    }
  }

  /** Look up the truth value of a sentence */
  lookUp(sentence:Sentence|string):TruthValue|'?' {
    if(typeof sentence === 'string')
      return this.lookUp(quickSentence(sentence));
    const mapped = this.idMapSentence(sentence);
    const predicateSymbol = mapped.predicate;
    const argsSymbol = stringifyArgs(mapped);

    if(this.index[predicateSymbol] && this.index[predicateSymbol][argsSymbol])
      return this.index[predicateSymbol][argsSymbol].truth;
    else
      return this.defaultTruthValue;
  }

  /** Get a list of all truth-assignments in the table */
  get facts():{sentence:Sentence, truth:TruthValue|'?'}[] {
    return [...this.iterate()]
  }

  /** 
   * Iterate through every truth-assignement in the table 
   */
  *iterate() {
    for(let P in this.index)
      for(let assignment of this.byPredicate(P))
        yield assignment;
  }

  /**
   * Iterate all truth assignements with the given predicate. 
   */
  *byPredicate(P:Predicate) {
    let subIndex = this.index[P]
    for(let i in subIndex)
      yield subIndex[i];
  }

  /**
   * Creates a new truth table using only the truth-assignments that pass the test implemented by the provided function.
   */
  filter(callback:(assignment:{sentence: Sentence, truth:TruthValue|'?'}) => boolean):TruthTable<TruthValue> {
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

  

  /**
   * Get a string representation of the table.
   */
  get symbol() {
    return this.toString();
  }

  /**
   * Get a string representation of the table.
   */
  toString() {
    return '{\n' +
    this.facts
      .map(({sentence, truth}) => `\t${stringifySentence(sentence)}=${truth}`)
      .join('\t&\n') 
    + '\n}';
  }

  /**
   * Count the number of truth-assignments in the table. 
   */
  get length() : number {
    // TODO: This is horrible for memory consumption and unscalable. Just count them, no need to buffer an array.
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

  /**
   * Alias for merge method
   * @alias merge
   */
  eat(...tables:TruthTable<TruthValue>[]):this {
    return this.merge(...tables);
  }

  /**
   * Make one entity identical to another in the context of this table
   */
  makeIdentical(a: Entity, b:Entity, addToMap=true) {
    a = this.idMapEntity(a);
    b = this.idMapEntity(b);

    for(let {sentence, truth} of this.iterate()) {
      if(sentence.args.includes(b)) {
        let newSentence = {
          predicate: sentence.predicate,
          args: sentence.args.map(e => e == b ? a : e),
        }
        this.remove(sentence)
        this.assign(newSentence, truth);
      }
    }

    if(addToMap)
      this.identityMap[b] = a;
  }

  /** Declare an entity identical to another. */
  //makeIdentical(
    //mainEntity:Entity, 
    //duplicate:Entity, 
    //[>* Should the identity be added to the identity map? Set to `false` if the duplicate entity will never be reused. <]
    //addToMap=true
  //) {
    //mainEntity = this.idMapEntity(mainEntity);

    //for(let {sentence} of this.iterate()) {
      //let originalSymbol = stringifyArgs(sentence);

      //for(let i in sentence.args)
        //if(sentence.args[i] == duplicate)
          //sentence.args[i] = mainEntity;

      //// If the arguments have been changes, change the sentence's key in the index
      //let newSymbol = stringifyArgs(sentence);
      //if(newSymbol != originalSymbol) {
        //let subIndex = this.index[sentence.predicate];
        //if(!subIndex)
          //throw 'Indexing fault: ' + sentence.predicate;

        //subIndex[newSymbol] = subIndex[originalSymbol]
        //delete subIndex[originalSymbol];
      //}
    //}

    //// Add an entry to the identity map so that both entities can be used interchangeably.
    //if(addToMap)
      //this.identityMap[duplicate] = mainEntity;
  //}

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

  quietlyAddIdentities(idMap: IdentityMap) {
    Object.assign(this.identityMap, idMap);
  }

  /** 
   * Check that another table could be merged into this table without changing any existing assignements. 
   * */
  checkCompatible(table: TruthTable<TruthValue>) {
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

  /**
   * @deprecated
   * Use `predicates` instead.
   */
  get predicateSymbols() {
    return Object.keys(this.index);
  }

  /**
   * Get a list of all of the predicates involved in the table.
   */
  get predicates() {
    return Object.keys(this.index);
  }

  static merge(...tables:TruthTable[]) {
    let combined = new TruthTable;

    for(let table of tables)
      combined.merge(table);

    return combined;
  }
}
