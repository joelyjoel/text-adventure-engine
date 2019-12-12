import { anyPersonRegex } from "./util/conjugate";
import { or, g, wholeWord, initial, initialAndWholeWord } from "./util/regops.extended";
import { compose, makeNegative } from "./util/compose";
import { LPredicate } from "./linking/LPredicate";
import { getAuxiliaryVerb } from "./util/getAuxiliaryVerb";
import { Template } from "./Template";
import { Predicate } from "./logic";
import { Tense, allTenses, verbToTense } from "./util/tense";
import { questionRegex } from "./util/verbOperations";

type Param = {name: string, index:number, entity: true}

export class PredicateSyntax {
  /** The infinitive form of the verb. */
  readonly infinitive: string;

  /** A regex used for parsing the verb. */
  readonly verbRegex: RegExp;

  /** A regex which matches the subject and conjugated verb (with auxiliary before the known). E.g./ "do you see" */
  readonly questionRegex: RegExp;

  /** A regex that matches any of the prepositions in this syntax. */
  readonly prepositionRegex: RegExp|null;

  /** A list of prepositions in this regex */
  readonly prepositions: string[];

  /** Does the regex have an object parameter? */
  readonly includesObject: boolean;

  /** Does the syntax have subject parameter? */
  readonly includesSubject: boolean;

  /** Ordered list of syntax parameters. */
  readonly params: Param[];

  /** Used for making ordered lists from associative arguments. */
  readonly paramIndex: {[key:string]: Param}

  /** How many arguments does the syntax take? */
  readonly numberOfArgs: number;

  /** The linked logical predicate. */
  private _predicate?: LPredicate;

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

  /** Link this syntax to a syntactic predicate */
  assign(P?:LPredicate):this {
    if(!this._predicate)
      throw "Cannot assign multiple predicates to one syntax";

    if(P && !this._predicate)
      this._predicate = P;
    return this;
  }

  get predicate():LPredicate|undefined {
    return this._predicate;
  }

  set predicate(P:LPredicate|undefined) {
    this.assign(P)
  }

  parse(
    str:string, 
    options:Tense|{tense:Tense, question?:boolean, negative?: false|'not'} = 'simple_present'
  ):{
    args: (string|number)[];
    syntax: PredicateSyntax;
    tense: Tense;
    question: boolean,
    negative: false | 'not'
  }|null  {
    // De-structure arguments
    if(typeof options == 'string')
      options = {tense:options as Tense}
    const {tense, question=false, negative=false} = options;

    // First parse verb-phrase, getting the subject.
    // TODO: Add indexing here to make more efficient
    let reg = initialAndWholeWord(this.composeVerbPhraseRegex({
      tense, question, negative
    }))
    let verbPhraseParse = reg.exec(str);
    if(verbPhraseParse) {
      let [verbPhrase, subject] = verbPhraseParse;
      let afterVerb = str.slice(verbPhrase.length).trim();

      let assoc = this.parsePrepositions(afterVerb);
      if(!assoc)
        return null;

      if(this.includesSubject)
        assoc.subject = subject;

      return {
        args: this.orderArgs(assoc),
        syntax:this,
        tense, question, negative
      }
    } else 
      return null;
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

  parse_simple_present_question(str:string):{
    args: (string|number)[];
    syntax: PredicateSyntax;
    tense: 'simple_present_question';
  }|null {
    let regexResult = this.questionRegex.exec(str);
    if(!regexResult)
      return null;

    let [verbPhrase, subject] = regexResult

    let afterVerb = str.slice(verbPhrase.length).trim()
    let assoc = this.parsePrepositions(afterVerb);
    if(!assoc)
      return null;

    if(this.includesSubject)
      assoc.subject = subject;

    return {
      args: this.orderArgs(assoc),
      syntax: this,
      tense: 'simple_present_question'
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

  composeVerbPhraseRegex(
    options:{tense:Tense, question:boolean, negative?:false | 'not'}
  ) {
    // De-structure options.
    const {tense, question, negative} = options;

    let verb = verbToTense(this.infinitive, tense);
    if(negative == 'not') 
      verb = makeNegative(verb);


    return question 
      ? questionRegex(verb) 
      : new Template(`_ <${verb}`).regex()
  }

  str(
    args:string[], 
    options:Tense|{tense?:Tense, question?:boolean, negative?: false|'not'}={}
  ) {
    if(typeof options == 'string')
      options = {tense: options};
    const {tense='simple_present', question=false, negative=false} = options
    let assoc = this.associateArgs(args);

    return compose({
      tense, infinitive:this.infinitive, ...assoc, question, negative
    });
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


