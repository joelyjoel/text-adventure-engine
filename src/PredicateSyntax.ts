import { anyPersonRegex } from "./util/conjugate";
import { or, g, wholeWord, initial } from "./util/regops.extended";
import { constructSentence, Tense } from "./util/constructSentence";
import { SyntacticPredicate } from "./linking/SyntacticPredicate";
import { getAuxiliaryVerb } from "./util/getAuxiliaryVerb";
import { Template } from "./Template";

type Param = {name: string, index:number, entity: true}

export class PredicateSyntax {
  readonly infinitive: string;
  readonly verbRegex: RegExp;
  /** A regex which matches the subject and conjugated verb (with auxiliary before the known). E.g./ "do you see" */
  readonly questionRegex: RegExp;
  readonly prepositions: string[];
  readonly prepositionRegex: RegExp|null;
  readonly includesObject: boolean;
  readonly includesSubject: boolean;
  readonly params: Param[];
  /** Used for making ordered lists from associative arguments. */
  readonly paramIndex: {[key:string]: Param}
  readonly numberOfArgs: number;

  predicate?: SyntacticPredicate;

  constructor(infinitive:string, params:string[]) {
    this.infinitive = infinitive;

    // Create a regex for parsing verbs
    this.verbRegex = wholeWord(anyPersonRegex(infinitive));

    // Create a question regex
    let {aux, remainder} = getAuxiliaryVerb(this.infinitive);
    this.questionRegex = initial(new Template(
      '>' + aux + ' _' + (remainder ? ' ' + remainder : '')
    ).regex());

    // Make a list of preopositional arguments
    this.prepositions = params.filter(
      param => !/subject|object/.test(param));

    // Create a regex for parsing prepositional arguments
    this.prepositionRegex = this.prepositions.length ? g(wholeWord(
      or(...this.prepositions).source
    )) : null

    this.includesSubject = params.includes('subject');
    this.includesObject = params.includes('object');

    this.params = params.map((name, index) => ({name, index, entity:true}))

    this.paramIndex = {};
    for(let i=0; i<params.length; ++i)
      this.paramIndex[params[i]] = this.params[i];

    this.numberOfArgs = this.params.length;
  }

  parse(str:string, tense:Tense):{
    args: (string|number)[];
    syntax: PredicateSyntax;
    tense: Tense;
  }|null  {
    switch(tense) {
      case 'simple_present':
        return this.parse_simple_present(str);

      case 'simple_question':
        return this.parse_simple_question(str);

      default:
        throw `Unexpected tense: ${tense}`
    }
  }

  parse_simple_present(str:string):{
    args: (string|number)[];
    syntax: PredicateSyntax;
    tense: 'simple_present';
  }|null {
    // First locate the verb
    let verbParse = this.verbRegex.exec(str)
    if(verbParse) {
      let afterVerb = str.slice(verbParse.index+verbParse[0].length).trim();

      let assoc = this.parsePrepositions(afterVerb);
      if(!assoc)
        return null

      if(this.includesSubject)
        assoc.subject = str.slice(0, verbParse.index).trim();

      return {
        args: this.orderArgs(assoc),
        syntax: this,
        tense: 'simple_present',
      }
    } else 
      // Couldn't find verb.
      return null 
  }

  parse_simple_question(str:string):{
    args: (string|number)[];
    syntax: PredicateSyntax;
    tense: 'simple_question';
  }|null {
    let regexResult = this.questionRegex.exec(str);
    console.log(regexResult)
    if(!regexResult)
      return null;

    let [verbPhrase, subject] = regexResult

    console.log(`verbPhrase: ${verbPhrase}`)
    console.log(`subject: ${subject}`)

    let afterVerb = str.slice(verbPhrase.length).trim()
    let assoc = this.parsePrepositions(afterVerb);
    if(!assoc)
      return null;

    if(this.includesSubject)
      assoc.subject = subject;

    return {
      args: this.orderArgs(assoc),
      syntax: this,
      tense: 'simple_question'
    }
  }

  parsePrepositions(afterVerb:string) {
    let argList:string[] = [];
    let argNames = ['object'];
    
    let prepParse;
    let strIdx = 0;
    let i = 0;

    // Parse the prepositional arguments
    if(this.prepositionRegex)
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
    for(let i in argList) {
      // Exit with null if duplicate preposition found.
      if(assoc[argNames[i]])
        return null;
      assoc[argNames[i]] = argList[i];
    }

    return assoc
  }

  str(args:string[], tense:Tense='simple_present') {
    let assoc = this.associateArgs(args);

    return constructSentence({tense, infinitive:this.infinitive, ...assoc});
  }

  /** Convert associative arguments into ordered argument list */
  orderArgs(assoc:{[key:string]:string}) {
    let ordered = [];
    for(let key in assoc)
      ordered[this.paramIndex[key].index] = assoc[key];
    
    return ordered;
  }

  /** Convert ordered argument list into an associative argument object. */
  associateArgs(ordered: string[]) {
    let assoc:{[key:string]:string} = {};
    for(let i in ordered) {
      assoc[this.params[i].name] = ordered[i];
    }
    return assoc;
  }
}


