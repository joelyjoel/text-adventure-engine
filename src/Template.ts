import {whole} from 'regops'

const placeholderRegex = /@?_(?:'s)?/g;
const conjugatorRegex = /(?:<|>)\w+/g ;

export class Template {
  readonly args: {
    literal:boolean;

  }[];
  readonly template: string;

  constructor(template:string) {
    this.template = template

    let placeholders = template.match(placeholderRegex);
    
    if(placeholders)
      this.args = placeholders.map(ph => ({
        literal: /@/.test(ph),
        number: /#/.test(ph),
      }))
    else
      this.args = [];

    
  }

  str(args:string[]) {
    if(args.length != this.args.length)
      throw "Wrong number of arguments for template."

    let fluff = this.template.split(placeholderRegex);

    let str = fluff[0];
    for(let i=1; i<fluff.length; ++i)
      str += args[i-1] + fluff[i];

    return str;
  }

  regex() {
    let argRegexs = this.args.map(arg => '([\\w ]+)')
    let fluff = this.template.split(placeholderRegex);
    let src = fluff[0];
    for(let i=1; i<fluff.length; ++i)
      src += argRegexs[i-1] + fluff[i]

    return new RegExp(src, 'i');
  }

  parse(str:string) {
    console.log("parsing:", str)
    let parse = whole(this.regex()).exec(str);
    if(parse)
      return parse.slice(1);
    else
      return null;
  }
}