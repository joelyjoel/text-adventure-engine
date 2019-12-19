import {whole, autoBracket} from 'regops'
import { 
  possessiveAdjectiveRegex, 
  toPossessiveAdjective 
} from './util/toPossessiveAdjective';
import { getPerson } from './util/getPerson';
import { conjugate, anyPersonRegex } from './util/conjugate';
import { LPredicate } from './linking/LPredicate';
import { Tense } from './util/tense';

const placeholderRegex = /@?#?_(?:'s)?/g;
const conjugateRegex = /(?:<|>)\w+/g;

export class Template {
  readonly params: {
    literal:boolean;
    possessive: boolean;
    number: boolean;
    entity: boolean;
  }[];
  numberOfArgs: number;
  tense: Tense;
  readonly template: string;

  predicate?: LPredicate;

  constructor(template:string, tense:Tense='simple_present') {
    this.template = template

    this.tense = tense;

    let placeholders = template.match(placeholderRegex);

    if(placeholders)
      this.params = placeholders.map(ph => {
        const literal = /@/.test(ph);
        const  number = /#/.test(ph);
        const possessive = /\'s/.test(ph);
        const entity = !(literal || number);
        return { literal, number, possessive, entity}
      })
    else
      this.params = [];

    this.numberOfArgs = this.params.length;
    
  }

  /** Generate a string given some arguments. */
  str(args:string[]) {
    // Throw an error if wrong number of arguments are given.
    if(args.length != this.params.length)
      throw "Wrong number of arguments for template."

    // Prepare arguments
    args = args.map((arg, i) => {
      if(this.params[i].possessive)
        return toPossessiveAdjective(arg);
      else
        return arg;
    })

    let fluff = this.template.split(placeholderRegex);

    let str = handleConjugation(fluff[0], undefined, args[0]);
    for(let i=1; i<fluff.length; ++i) {
      let arg = args[i-1];
      str += arg + handleConjugation(fluff[i], arg, args[i]);
    }

    return str;
  }

  /** Get a regular expression version of the template. */
  regex() {
    let argRegexs = this.params.map(arg => {
      if(arg.possessive)
        return possessiveAdjectiveRegex.source;
      else if(arg.number) 
        return '-?[\\.0-9]+'
      else
        return '[\\w ]+'
    }).map(str => '('+str+')')
    let fluff = this.template.split(placeholderRegex);
    let src = handleRegexConjugation(fluff[0]);
    for(let i=1; i<fluff.length; ++i)
      src += argRegexs[i-1] + handleRegexConjugation(fluff[i])

    return new RegExp(src, 'i');
  }

  /** Extract the arguments from a given string if it matches the template. */
  parse(str:string) {
    let parse = new RegExp(whole(this.regex()).source, 'i').exec(str);
    if(parse) {
      let args:(string|number)[] = parse.slice(1);
      for(let i in this.params)
        if(this.params[i].number)
          args[i] = parseFloat(args[i] as string);
      return {args, syntax:this, tense:this.tense};
    } else
      // No parse found.
      return null;
  }

  /** Check whether the template matches a given string. */
  test(str:string) {
    return new RegExp(whole(this.regex()).source, 'i').test(str);
  }
}

/** (Internal) Handle conjugation for part of a `Template`. */
function handleConjugation(str:string, left?:string, right?:string) {
  const leftPerson = left ? getPerson(left) : null;
  const rightPerson = right ? getPerson(right) : null;

  const verbs = str.match(conjugateRegex);

  if(!verbs)
    return str;

  const fluff = str.split(conjugateRegex);
  let out = fluff[0];
  for(let i=0; i<verbs.length; ++i) {
    let direction = verbs[i][0]
    let verb = verbs[i].slice(1);
    
    if(direction == '>' && rightPerson != null) {
      // Conjugate to the right
      verb = conjugate(verb, rightPerson);

    } else if(direction == '<' && leftPerson != null) {
      // Conjugate to the left
      verb = conjugate(verb, leftPerson);

    } else
      throw `Couldn't handle conjugation: (${left})${str}(${right})`;

    out += verb + fluff[i+1];
  }

  return out;
}

/** (Internal) Handle regexp conjugation for part of a `Template` */
function handleRegexConjugation(str:string, left?:string, right?:string) {
  const leftPerson = typeof left == 'string' ? getPerson(left) : null;
  const rightPerson = typeof right == 'string' ? getPerson(right) : null;

  const verbs = str.match(conjugateRegex);

  if(!verbs)
    return str;

  const fluff = str.split(conjugateRegex);
  let interleaved = [fluff[0]];
  for(let i=0; i<verbs.length; ++i) {
    let verb = autoBracket(anyPersonRegex( verbs[i].slice(1)).source);
    
    interleaved.push( verb , fluff[i+1])
  }

  return interleaved.join('');
}