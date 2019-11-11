import { Entity } from "./Entity";

export class Variable extends Entity {
  static variable_counter = 0;

  constructor() {
    // Create a unique symbol for this variable.
    let n = Variable.variable_counter++;
    let symbol = 'xyz'[n%3] + (Math.floor(n/3) || '');

    super(symbol);
  }
}