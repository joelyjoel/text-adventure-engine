import { StatementSyntax } from "./parsing/parseStatement";
import { anyPersonRegex } from "./util/conjugate";
import { or, g, wholeWord } from "./util/regops.extended";

export class PredicateSyntax {
  infinitive: string;
  verbRegex: RegExp;
  prepositions: string[];
  prepositionRegex: RegExp;
  includesObject: boolean;
  includesSubject: boolean;
  /** Used for making ordered lists from associative arguments. */
  paramIndex: {[key:string]: number}

  constructor(infinitive:string, params:string[]) {
    this.infinitive = infinitive;

    // Create a regex for parsing verbs
    this.verbRegex = wholeWord(anyPersonRegex(infinitive));

    // Make a list of preopositional arguments
    this.prepositions = params.filter(
      param => !/subject|object/.test(param));

    // Create a regex for parsing prepositional arguments
    this.prepositionRegex = g(wholeWord(
      or(...this.prepositions).source
    ))

    this.includesSubject = params.includes('subject');
    this.includesObject = params.includes('object');

    this.paramIndex = {};
    for(let i=0; i<params.length; ++i)
      this.paramIndex[params[i]] = i;
  }

  parse(str:string) {
    // First locate the verb
    let verbParse = this.verbRegex.exec(str)
    if(verbParse) {
      let afterVerb = str.slice(verbParse.index+verbParse[0].length).trim();


      let argList:string[] = [];
      let argNames = ['object'];
      
      let prepParse;
      let strIdx = 0;
      let i = 0;

      // Parse the prepositional arguments
      while((prepParse = this.prepositionRegex.exec(afterVerb))) {
        argList[i] = afterVerb.slice(strIdx, prepParse.index).trim();
        argNames[i+1] = prepParse[0];
        // Exit early if parse finds a rogue direct object or absence thereof.
        if(i == 0) {
          if(!this.includesObject && argList[i].length != 0)
            return null;
          else if(this.includesObject && argList[i].length == 0)
            return null;
        }

        strIdx = prepParse.index + prepParse[0].length;
        ++i;
      }

      argList.push(afterVerb.slice(strIdx).trim());
      
      if(!this.includesObject) {
        argList.shift();
        argNames.shift();
      }

      // Create an associative object of the arguments.
      let assoc:{[key:string]:string} = {};
      if(this.includesSubject)
        assoc.subject = str.slice(0, verbParse.index).trim();
      for(let i in argList) {
        // Exit with null if duplicate preposition found.
        if(assoc[argNames[i]])
          return null;
        assoc[argNames[i]] = argList[i];
      }

      let ordered = this.orderArgs(assoc);
      return {
        args: ordered,
        syntax: this,
      }
    } else 
      // Couldn't find verb.
      return null 
  }

  /** Convert associative arguments into ordered argument list */
  orderArgs(assoc:{[key:string]:string}) {
    let ordered = [];
    for(let key in assoc)
      ordered[this.paramIndex[key]] = assoc[key];
    
    return ordered;
  }
}


