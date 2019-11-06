import { Template } from "./Template";

export type Substitutable = string|Substitution;

export class Substitution {
  template: Template;
  args: Substitutable[];

  constructor(template:Template|string, ...args:Substitutable[]) {
    if(typeof template == 'string')
      template = new Template(template);

    this.template = template;
    this.args = args;
  }

  str() : string {
    let stringArgs = this.args.map( arg => {
      if(typeof arg == 'string')
        return arg;
      else if(arg instanceof Substitution)
        return arg.str();
      else
        throw "Unexpected Substitution argument: " + arg;
    })

    return this.template.str(stringArgs);
  }

  /** Shorthand constructor for `Substitution` */
  static sub(template: string | Template, ...args: Substitutable[]) {
    return new Substitution(template, ...args);
  }
}