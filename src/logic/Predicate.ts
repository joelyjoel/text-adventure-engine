export class Predicate {
  static predicate_counter = 0;

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
      return 'PQR'[this.id%3] + (Math.floor(this.id/3) || '');
  }

  get unary() {
    return this.numberOfArgs == 1;
  }

  get binary() {
    return this.numberOfArgs == 2;
  }
}