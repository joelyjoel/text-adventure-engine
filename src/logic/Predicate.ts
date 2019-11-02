export class Predicate {
  static predicate_counter = 0;

  id: number;
  _symbol?: string;

  constructor(symbol?:string) {
    this.id = Predicate.predicate_counter++;

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
}