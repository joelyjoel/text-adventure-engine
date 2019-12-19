import { anyPersonRegex, conjugate, THIRD_PERSON_SINGULAR } from "./util/conjugate";
import { or, g, wholeWord, initial, initialAndWholeWord, optionalConcatSpaced, concatSpaced, concat, optional } from "./util/regops.extended";
import { compose, makeNegative } from "./util/compose";
import { LPredicate } from "./linking/LPredicate";
import { getAuxiliaryVerb } from "./util/getAuxiliaryVerb";
import { Template, placeholderRegex } from "./Template";
import { Tense, allTenses, verbToTense } from "./util/tense";
import { questionRegex } from "./util/verbOperations";
import { toCamelCase } from "./util/toCamelCase";
import { sentenceFormSymbol } from "./util/sentenceFormSymbol";

type Param = {name: string, index:number, entity: true}

export class PredicateSyntax {
  /** The infinitive form of the verb. */
  readonly infinitive: string;

  /** A regex used for parsing the verb. */
  readonly verbRegex: RegExp;

  /** A regex which matches the subject and conjugated verb (with auxiliary before the known). E.g./ "do you see" */
  readonly questionRegex: RegExp;

  /** An index of regular expressions for each form. */
  private regexIndex: {[key:string]: RegExp};

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

  readonly name: string;

  constructor(infinitive:string, params:string[]) {
    this.infinitive = infinitive;

    this.regexIndex = {};

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

    // Choose a name
    this.name = toCamelCase(conjugate(this.infinitive, THIRD_PERSON_SINGULAR), ...this.prepositions)
  }

  /** Link this syntax to a syntactic predicate */
  assign(P?:LPredicate):this {
    if(this._predicate)
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
    options:{tense:Tense, question?:boolean, negative?: false|'not', nounPhraseFor?:string}|Tense = 'simple_present'
  ):{
    args: (string|number)[];
    syntax: PredicateSyntax;
    tense: Tense;
    question: boolean;
    negative: false | 'not';
    nounPhraseFor: string | null
  }|null  {
    // De-structure arguments
    if(typeof options == 'string')
      options = {tense:options as Tense}
    const {tense, question=false, negative=false, nounPhraseFor=null} = options;

    // First parse verb-phrase, getting the subject.
    // TODO: Add indexing here to make more efficient
    let reg = this.composeVerbPhraseRegex({
      tense, question, negative, nounPhraseFor,
    })
    if(!nounPhraseFor || nounPhraseFor == 'subject')
      reg = initialAndWholeWord(reg);
    else
      reg = wholeWord(reg);

    let verbPhraseParse = reg.exec(str);

    if(verbPhraseParse) {
      let [verbPhrase, subject] = verbPhraseParse;
      let afterVerb = str.slice(verbPhraseParse.index + verbPhrase.length).trim();

      let assoc = this.parsePrepositions(afterVerb);
      if(!assoc)
        return null;
    

      // If parsing for a noun phrase form, read the part in front of the verb phrase
      if(nounPhraseFor && nounPhraseFor != 'subject') {
        let preVerb = str.slice(0, verbPhraseParse.index).trim()
        // Exit early if preverb is missing.
        if(!preVerb)
          return null
        else
          assoc[nounPhraseFor] = preVerb;
      } 

      // Get the subject argument
      if(this.includesSubject)
        assoc.subject = subject;

      // Check there is the correct number of arguments
      if(Object.keys(assoc).length != this.numberOfArgs)
        return null;


      return {
        args: this.orderArgs(assoc),
        syntax:this,
        tense, question, negative, nounPhraseFor
      }
    } else
      return null;
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
    options:{tense:Tense, question:boolean, negative?:false | 'not', nounPhraseFor?: string|null}
  ) {
    // De-structure options.
    const {tense, question=false, negative=false, nounPhraseFor=null} = options;

    // First check the index.
    let formSymbol = sentenceFormSymbol({tense, question, negative, nounPhraseFor})
    if(this.regexIndex[formSymbol])
      return this.regexIndex[formSymbol];

    if(nounPhraseFor && question)
      throw "Arguments `question` & `nounPhraseFor` are incompatible."

    let verb = verbToTense(this.infinitive, tense);
    if(negative == 'not') 
      verb = makeNegative(verb);

    let result;
    if(question)
      result = questionRegex(verb)
    else if(nounPhraseFor == 'subject')
      result = new Template(`_ which <${verb}`).regex();
    else if(nounPhraseFor == 'object')
      result = new Template(`which _ <${verb}`).regex();
    else if(nounPhraseFor)
      result = new Template(`${nounPhraseFor} which _ <${verb}`).regex()
    else
      result = new Template(`_ <${verb}`).regex()

    this.regexIndex[formSymbol] = result;
    return result;
  }

  str(
    args:string[], 
    options:{
      tense?:Tense; 
      question?:boolean;
      negative?: false|'not';
      nounPhraseFor?: string;
    }|Tense={}
  ) {
    if(typeof options == 'string')
      options = {tense: options};
    const {tense='simple_present', question=false, negative=false, nounPhraseFor=null} = options
    let assoc = this.associateArgs(args);

    return compose({
      tense, infinitive:this.infinitive, ...assoc, question, negative, nounPhraseFor
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

