/**
 * The `Predicate` class corresponds exactly to eponymous concept 
 * in predicate logic. It represents a type of sentence that can 
 * be made about some entities. Each predicate accepts a specific 
 * number (`numberOfArgs` property) of arguments where each argument is 
 * an `Entity`.
 *
 * Again, using a whole class for this object might be overly 
 * fancy when a simple string would suffice. String predicates 
 * would need a simple way to encode how many arguments they accept, 
 * I think Prolog has a convention for this.
 */
export class Predicate {
  protected static predicate_counter = 0;

  id: number;
  numberOfArgs: number;
  _symbol?: string;

  constructor(numberOfArgs:number, symbol?:string) {
    this.id = Predicate.predicate_counter++;
    this.numberOfArgs = numberOfArgs;

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
      return Predicate.getSymbol(this.id);
  }

  // get knownSymbol() {
  //   return `known_${this.symbol}`;
  // }

  /** True if the predicate takes one argument. */
  get unary() {
    return this.numberOfArgs == 1;
  }

  /** True if the predicate takes exactly two arguments. */
  get binary() {
    return this.numberOfArgs == 2;
  }

  static getSymbol(id:number) {
    return 'pqr'[id%3] + (Math.floor(id/3) || '')
  }

  static getNextSymbol() {
    return Predicate.getSymbol(Predicate.predicate_counter)
  }
}
