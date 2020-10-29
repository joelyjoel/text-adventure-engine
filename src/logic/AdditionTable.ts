import {Entity, Sentence, stringifyArgs, Predicate} from './basics';
import {TruthTable, INDIFFERENT} from './TruthTable';
import {quickSentence} from './parse';

export class AdditionTable<TruthValue extends string> extends TruthTable<TruthValue> {
  parent: TruthTable<TruthValue> | null;
  constructor(parent?:TruthTable<TruthValue> | null, addition?:TruthTable<TruthValue>) {
    super();
    this.parent = parent || null;
    if(addition)
      this.eat(addition);
  }

  /**
   * Look up the truth value of the given sentence. Checks this table frist, and then the parent(s) recursively. Priority on truth values is given to children.
   */
  lookUp(sentence:Sentence|string):TruthValue|'?' {
    if(typeof sentence === 'string')
      return this.lookUp(quickSentence(sentence));

    // Handle any entity equalities..
    const mapped = this.idMapSentence(sentence);
    const {predicate} = mapped;
    const args = stringifyArgs(mapped);

    // First check this tables index.
    if(this.index[predicate] && this.index[predicate][args])
      return this.index[predicate][args].truth;
    else if(this.parent)
      // Not in index, check the parent table.
      return this.parent.lookUp(sentence);
    else
      return INDIFFERENT;
  }

  /**
   * Remove a truth assignment from a the table
   */
  remove(sentence:Sentence|string, truth?:TruthValue): void {
    if(typeof sentence === 'string')
      return this.remove(quickSentence(sentence));
    if(truth && this.lookUp(sentence) != truth)
      throw 'Unexpected truth value when removing assignment from AdditionTable';

    this.assign(sentence, '?');
  }


  /** 
   * Iterate all truth assigments with the given predicate.
   */
  *byPredicate(P: Predicate) {
    // Yield every assignemnts with predicate P.
    let subIndex = this.index[P];
    for(let i in subIndex)
      yield subIndex[i];

    // Recursively iterate parents assignemnts but filter out conflicts.
    if(this.parent)
      for(let assignment of this.parent.byPredicate(P))
        // If subIndex does not include a sentence with the same arguments.
        if(!subIndex[stringifyArgs(assignment.sentence)])
          yield assignment;
  }

  * iterateAddition() {
    for(let P in this.index)
      for(let args in this.index[P])
        yield this.index[P][args];
  }

  /**
   * Get a string representation of the table.
   */
  toString() {
    const str = TruthTable.prototype.toString.call(this);
    if(this.parent)
      return `${this.parent.symbol} & ${str}`;
    else
      return str;
  }

  /**
   * Create a copy of the table
   */
  clone(): AdditionTable<TruthValue> {
    let clone = new AdditionTable<TruthValue>(this.parent);

    // Loop through all entries in this table
    for(let {sentence, truth} of this.iterateAddition())
      clone.assign(
        {predicate: sentence.predicate, args: [...sentence.args]},
        truth
      )

    // Copy identity mappings.
    clone.quietlyAddIdentities(this.identityMap);

    return clone;
  }

  get addition() {
    let addition = new TruthTable<TruthValue>();

    // copy all entries in the table
    for(let {sentence, truth} of this.iterateAddition())
      addition.assign(
        {predicate: sentence.predicate, args: [...sentence.args]},
        truth
      )

    // copy identity mappings
    addition.quietlyAddIdentities(this.identityMap);

    return addition;
  }

  /**
   * Get a list of all predicates involved in the table.
   */
  get predicates() {
    let list = Object.keys(this.index);
    if(this.parent)
      return [
        ...list,
        ...this.parent.predicates.filter(P => !list.includes(P)),
      ]
    else
      return list;
  }

  idMapEntity(e:Entity):Entity {
    while(true) {
      if(this.identityMap[e])
        e = this.identityMap[e];
      else if(this.parent && e != (e = this.parent.idMapEntity(e)))
        continue
      else
        return e;
    }
  }


  //~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~// 
  // .*.*.*.*.*.*.*.*.*. NEW METHODS FOR THIS CLASS *.*.*.*.*.*.*.*.*.*.*. //
  //~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~// 

  /**
   * Create a new table by recursively merging the addition(s) with their parents
   * NOTE: Could be expensive for very large parent tables, in which case consider a strategy using `mergeToParent` method.
   */
  flatten():TruthTable<TruthValue> {
    if(this.parent) {
      // Flatten parent if its an addition table, otherwise clone it.
      let table = this.parent instanceof AdditionTable ? 
        this.parent.flatten() : this.parent.clone();

      for(let {sentence, truth} of this.iterateAddition())
        table.assign(sentence, truth);

      return table;
    } else
      return this.addition;
  }

  /**
   * Merge this addition into the parent truth table.
   */
  mergeToParent():void {
    if(this.parent)
      for(let {sentence, truth} of this.iterateAddition())
        this.parent.assign(sentence, truth);
    else
      throw 'No Parent to merge into!';
  }

  /**
   * How many parent tables lie beneath this table in the addition stack.
   */
  get stackSize():number {
    if(this.parent) {
      if(this.parent instanceof AdditionTable)
        return this.parent.stackSize + 1;
      else
        return 1;
    } else
      return 0;
  }

  /**
   * @alias stackSize
   */
  get height() {
    return this.stackSize;
  }

}
