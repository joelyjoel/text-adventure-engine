/** Representing an object in the world. */

export class Entity {
  static entity_counter = 0;

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
}