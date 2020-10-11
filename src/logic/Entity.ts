/** 
 * Represents an object in the world. 
 *
 * A better name for this class would have been "Object", but 
 * obviously that was already taken by js and would have led to 
 * confusion. Entities represent something in the world. Pretty 
 * much anything really, but usually the sort of thing that 
 * could be referred to using a noun-phrase. For example, "the 
 * dog", "the orange square" etc. But importantly there are no 
 * linguistic features contained within the `Entity` class. In 
 * fact it has no features at all except a unique identifier 
 * number (the `id` property). Using the `symbol` accessor you 
 * can get a slightly more readable string version of the id 
 * using the conventions of predicate logic notation (a, b, c, 
 * a1, b1, c1, etc).
 *
 * Looking back, there is no need for `Entity` to be a class 
 * in its own right as it could just as easily be replaced by 
 * a function that spits out unique strings. This will probably 
 * be a feature of the big refactor.
 */
export class Entity {
  static entity_counter = 0;

  /** 
   * A unique number which identifies each Entity object. */
  readonly id:number;
  readonly _symbol?: string;

  constructor(symbol?:string) {
    this.id = Entity.entity_counter++;
    if(symbol) {
      if(/^\w+$/.test(symbol))
        this._symbol = symbol;
      else
        throw 'Invalid entity symbol: \"' + symbol + '\"';
    }
      
  }

  get symbol() {
    if(this._symbol)
      return this._symbol;
    else
      return 'abc'[this.id%3] + (Math.floor(this.id/3) || '');
  }

  /** 
   * Generate an unlimited quantity of new Entities.
   * */
  static * bulk() {
    while(true)
      yield new Entity;
  }

  static getSymbol(id:number) {
    return 'abc'[id%3] + (Math.floor(id/3) || '')
  }

  static getNextSymbol() {
    return Entity.getSymbol(Entity.entity_counter)
  }
}
