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

  get unary() {
    return this.numberOfArgs == 1;
  }

  get binary() {
    return this.numberOfArgs == 2;
  }

  static getSymbol(id:number) {
    return 'PQR'[id%3] + (Math.floor(id/3) || '')
  }

  static getNextSymbol() {
    return Predicate.getSymbol(Predicate.predicate_counter)
  }
}