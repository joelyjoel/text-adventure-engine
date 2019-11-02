import {whole, autoBracket} from 'regops'
import { possessiveAdjectiveRegex } from './util/toPossessiveAdjective';
import { getPerson } from './util/getPerson';
import { conjugate, anyPersonRegex } from './util/conjugate';

const placeholderRegex = /@?#?_(?:'s)?/g;
const conjugateRegex = /(?:<|>)\w+/g

export class Template {
  readonly params: {
    literal:boolean;
    possessive: boolean;
    number: boolean;
  }[];
  readonly template: string;

  constructor(template:string) {
    this.template = template

    let placeholders = template.match(placeholderRegex);
    
    if(placeholders)
      this.params = placeholders.map(ph => ({
        literal: /@/.test(ph),
        number: /#/.test(ph),
        possessive: /\'s/.test(ph)
      }))
    else
      this.params = [];

    
  }

  str(args:string[]) {
    if(args.length != this.params.length)
      throw "Wrong number of arguments for template."

    let fluff = this.template.split(placeholderRegex);

    let str = handleConjugation(fluff[0], undefined, args[0]);
    for(let i=1; i<fluff.length; ++i) {
      str += args[i-1] + handleConjugation(fluff[i], args[i-1], args[i]);
    }

    return str;
  }

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

  parse(str:string) {
    let parse = new RegExp(whole(this.regex()).source, 'i').exec(str);
    if(parse) {
      let args:(string|number)[] = parse.slice(1);
      for(let i in this.params)
        if(this.params[i].number)
          args[i] = parseFloat(args[i] as string);
      return args;
    } else
      return null;
  }
}


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
    console.log('verb:', verb);
    
    if(direction == '>' && rightPerson != null) {
      // Conjugate to the right
      verb = conjugate(verb, rightPerson);

    } else if(direction == '<' && leftPerson != null) {
      // Conjugate to the left
      verb = conjugate(verb, leftPerson);

    } else
      throw 'Something bad happened';

    out += verb + fluff[i+1];
  }

  return out;
}

function handleRegexConjugation(str:string, left?:string, right?:string) {
  const leftPerson = typeof left == 'string' ? getPerson(left) : null;
  const rightPerson = typeof right == 'string' ? getPerson(right) : null;

  const verbs = str.match(conjugateRegex);

  if(!verbs)
    return str;

  const fluff = str.split(conjugateRegex);
  let out = fluff[0];
  for(let i=0; i<verbs.length; ++i) {
    let verb = autoBracket(anyPersonRegex( verbs[i].slice(1)).source);
    
    out += verb + fluff[i+1];
  }

  return out;
}