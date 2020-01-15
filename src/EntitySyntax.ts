import { Noun } from "./Noun";
import { Adjective } from "./Adjective";
import { PredicateSyntax } from "./PredicateSyntax";
import { Tense, isTense } from "./util/tense";
import { pronounRegex } from "./parsing/parsePronoun";
import { toPlural } from "./util/plural";
import { properNounRegex } from "./parsing/parseProperNoun";
import { Entity, Sentence } from "./logic";
import { Context } from "./Context";

type EmbeddedSentence = {
  syntax: PredicateSyntax;
  args:EntitySyntax[]; 
  tense:Tense;
  nounPhraseFor:number;
  negative: boolean;
}
function isEmbeddedSentence(o:any):o is EmbeddedSentence {
  return typeof o == 'object'
    && o.syntax instanceof PredicateSyntax
    && o.args instanceof Array
    && o.args.every((arg:any) => arg instanceof EntitySyntax)
    && isTense(o.tense)
    && typeof o.nounPhraseFor == 'number'
    && typeof o.negative == 'boolean'
}

type Syntax = Adjective|Noun|EmbeddedSentence|string
// ^ note: KEEP LOCAL

export interface EntitySyntaxConstructorOptions {
  plural:boolean
}

export interface EntitySyntaxComposeOptions {
  maxAdjectives: number;
  minAdjectives: number;
  numberOfAdjectives: number

  
  article: 'the'|'a';
  definite: boolean;
  indefinite: boolean;


  useProperNoun: boolean;
  /** Probability (0 - 1) that a proper noun is used. */
  properNounProbability: number;
}

/** Defines ways to represent an adjective  */
export class EntitySyntax {

  /** A list of nouns which could be used to describe the entity. */
  nouns: Noun[];
  /** A list of adjectives which could be used to describe the entity. */
  adjectives: Adjective[];
  properNouns: string[];
  plural: boolean;
  sentences: EmbeddedSentence[];


  constructor(
    syntaxs:Syntax[], 
    options:Partial<EntitySyntaxConstructorOptions> = {}
  ) {
    this.nouns = [];
    this.adjectives = [];
    this.properNouns = [];
    this.plural = options.plural || false;

    this.addSyntaxs(...syntaxs)
  }

  compose(options:Partial<EntitySyntaxComposeOptions>={}) {
    // De-structure options
    const {
      minAdjectives = 0,
      maxAdjectives = this.adjectives.length,
      properNounProbability = 1/2,
      useProperNoun 
        = this.properNouns.length && (Math.random() < properNounProbability),
    } = options

    if(useProperNoun)
      return this.randomProperNoun()
    else {
      // Choose article
      let article 
      if(options.article)
        article = options.article;
      else if(options.indefinite === true || options.definite === false)
        article = this.plural ? 'some' : 'a'
      else 
        article = 'the';

      // Choose a noun
      let noun = this.randomNoun();
      if(this.plural)
        noun = toPlural(noun);

      // Choose adjectives
      let numberOfAdjectives:number
      if(options.numberOfAdjectives != undefined)
        numberOfAdjectives = options.numberOfAdjectives;
      else
        numberOfAdjectives = minAdjectives+Math.floor(Math.random()*(maxAdjectives-minAdjectives))

      let adjectives = this.randomAdjectives(numberOfAdjectives)

      // conjugate indefinite article
      if(article == 'a' || article == 'an') {
        let secondWord = adjectives.length ? adjectives[0] : noun;
        if(/^[aeiouh]/.test(secondWord))
          article = 'an'
        else
          article = 'a'
      }

      return [article, ...adjectives, noun].join(' ')
    }
  }

  randomNoun() {
    if(this.nouns.length)
      return this.nouns[Math.floor(Math.random()*this.nouns.length)].str;
    else
      return 'thing';
  }

  randomAdjectives(n:number) {
    return this.adjectives.sort(() => Math.random()*2 - 1)
      .slice(0, n)
      .map(adj => adj.str);
  }

  randomProperNoun() {
    return this.properNouns[Math.floor(Math.random()*this.properNouns.length)];
  }

  addSyntax(syntax:Syntax) {
    if(syntax instanceof Adjective)
      this.adjectives.push(syntax);
    else if (syntax instanceof Noun)
      this.nouns.push(syntax);
    else if(typeof syntax == 'string') {
      if(properNounRegex.test(syntax))
        this.properNouns.push(syntax);
      else
        throw `Invalid proper noun: '${syntax}'\nNote: Each word in a proper noun must begin with a capital letter.`
    } else if(isEmbeddedSentence(syntax)) {
      this.sentences.push(syntax)
    } else {
      console.warn(`EntitySyntax::addSyntax: Unexpected syntax:`, syntax)
      throw `Unexpected syntax: ${syntax}`
    }
  }

  addSyntaxs(...syntaxs:Syntax[]) {
    for(let syntax of syntaxs)
      this.addSyntax(syntax);
  }

  static forEntity(e:Entity, ctx:Context) {
    let table = ctx.truthTable;
    let result = new EntitySyntax([]);
    if(table) {
      for(let {statement, position} of table.involving(e)) {
        let syntaxs = ctx.linkingMatrix.meaningToSyntaxs({
          predicate: statement.sentence.predicate,
          truth: statement.truth,
        })

        for(let syntax of syntaxs) {
          if(syntax instanceof Adjective || syntax instanceof Noun)
            result.addSyntax(syntax)
          else if(syntax.tense && syntax.syntax)
            result.addSyntax({
              ...syntax, 
              nounPhraseFor:position, 
              negative:false,
              args: statement.sentence.args.map(
                e => EntitySyntax.forEntity(e, ctx)
              )
            })
          else
            console.warn('EntitySyntax.forEntity: unexpected syntax:', syntax)
        }
      }
    }

    for(let properNoun in ctx.properNouns)
      if(ctx.properNouns[properNoun] == e)
        result.addSyntax(properNoun)

    return result;
  }
}