// N   N  OOOO  U  U  N   N   PPPP H  H  RRRR    A    SSSS  EEEE  SSSS
// N N N  O  O  U  U  N N N   P  P HHHH  R  R   A A   SS    EEEE  SS
// N  NN  O  O  U  U  N  NN   PPP  H  H  R R   A   A    S   E       S
// N   N  OOOO  UUUU  N   N   P    H  H  R  R  A   A  SSSS  EEEE  SSSS

export type ArticleParse = 'the'|'a'|'an'|'some'|'any';
export function isArticleParse(o:any):o is ArticleParse {
  return typeof o === 'string' && 
    /the|a|an|some|any/.test(o)
}

/**
 * Throw an exception if given object is not a valid ArticleParse
 */
export function assertIsArticleParse(o:any): o is ArticleParse {
  if(isArticleParse(o))
    return true;
  else
    throw "Article parse is invalid: " + o;
}

export type AdjectiveParse = string;
export function isAdjectiveParse(o:any):o is AdjectiveParse {
  return typeof o === 'string';
}
export function assertIsAdjectiveParse(o:any):o is AdjectiveParse {
  if(isAdjectiveParse(o))
    return true;
  else 
    throw "Adjective parse is invalid: " + o;
}

export type NounParse = string;
export function isNounParse(o: any):o is NounParse {
  return typeof o === 'string';
}
export function assertIsNounParse(o: any):o is NounParse {
  if(isNounParse(o))
    return true;
  else
    throw `Noun parse is invalid: ${o}`;
}

export interface SimpleNounPhraseParse {
  kind: 'simpleNounPhrase';
  article: ArticleParse;
  adjectives: AdjectiveParse[];
  noun: NounParse;
  couldBePlural: boolean;
  couldBeSingular: boolean;
}

export function isSimpleNounPhraseParse(o:any):o is SimpleNounPhraseParse { 
  return o.kind == 'simpleNounPhrase' &&
    typeof o === 'object' &&
    isArticleParse(o.article) &&
    o.adjectives instanceof Array &&
    o.adjectives.every((adj:any) => isAdjectiveParse(adj)) &&
    isNounParse(o.noun) &&
    typeof o.couldBePlural === 'boolean' &&
    typeof o.couldBeSingular === 'boolean'
}

export function assertIsSimpleNounPhraseParse(o:any):o is SimpleNounPhraseParse {
  if(typeof o !== 'object')
    throw `Noun-phrase parse must be an object, recieved '${typeof o}'`;

  if(o.kind != 'simpleNounPhrase')
    throw `SimpleNounPhraseParse.kind must be 'simpleNounPhrase', recieved: ${o.kind}`;

  assertIsArticleParse(o.article);
  assertIsNounParse(o.noun);
  for(let adj of o.adjectives)
    assertIsAdjectiveParse(adj);
  if(typeof o.couldBePlural !== 'boolean')
    throw `SimpleNounPhraseParse.couldBePlural must be boolean recieved '${typeof o.couldBePlural}`;
  if(typeof o.couldBeSingular !== 'boolean')
    throw `SimpleNounPhraseParse.couldBeSingular must be boolean, recieved: '${typeof o.couldBeSingular}'`;

  // Otherwise,
  return true;
}

export interface PronounParse {
  kind: 'pronoun';
  pronoun: string;
  couldBeSubject: boolean;
  couldBeObject: boolean;
  couldBeSingular: boolean;
  couldBePlural: boolean;
}
export function isPronounParse(o:any):o is PronounParse {
  return typeof o === 'object' &&
    o.kind == 'pronoun' &&
    typeof o.pronoun == 'string' &&
    typeof o.couldBeObject == 'boolean' &&
    typeof o.couldBeSubject == 'boolean' &&
    typeof o.couldBeSingular == 'boolean' &&
    typeof o.couldBePlural == 'boolean' 
}
export function assertIsPronounParse(o:any):o is PronounParse {
  if(typeof o != 'object')
    throw `PronounParse must be an object, recieved ${o}`;
  if(o.kind != 'pronoun')
    throw `PronounParse.kind must be 'pronoun', recieved: ${o.kind}`;
  if(typeof o.pronoun != 'string')
    throw `PronounParse.pronoun must be a string, recieved: ${typeof o.pronoun}`;
  for(let field of ['couldBeObject', 'couldBeSubject', 'couldBeSingular', 'couldBePlural'])
    if(typeof o[field] != 'boolean')
      throw `PronounParse.${field} must be a boolean, recieved: ${typeof o[field]}`;

  // Otherwise,
  return true;
}

export type NounPhraseParse = SimpleNounPhraseParse|PronounParse;
export function isNounPhraseParse(o:any):o is NounPhraseParse {
  return isPronounParse(o) || isSimpleNounPhraseParse(o);
}
export function assertIsNounPhraseParse(o:any):o is NounPhraseParse {
  if(typeof o != 'object')
    throw 'NounPhraseParse must be an object, recieved: '+o;
  else if(o.kind == 'pronoun')
    return assertIsPronounParse(o);
  else if(o.kind == 'simpleNounPhrase')
    return assertIsSimpleNounPhraseParse(o);
  else
    throw 'NounPhraseParse must be either SimpleNounPhraseParse or PronounParse, recieved: '+JSON.stringify(o);
}


// v       v  eeeee  r rrr   b
//  v     v   e   e  rr   r  b
//   v   v    eeeee  r       bbbb   
//    v v     e      r       b   b
//     v       eee   r       bbbb

export type Tense = 'simplePresent' | 'presentContinuous' | 'simplePast' | 'pastContinuous' | 'presentPerfect' | 'presentPerfectContinuous' | 'pastPerfect' | 'pastPerfectContinuous' | 'futurePerfect' | 'futurePerfectContinuous' | 'simpleFuture' | 'futureContinuous';

export const allTenses = ['simplePresent' , 'presentContinuous' , 'simplePast',  'pastContinuous' , 'presentPerfect' , 'presentPerfectContinuous' , 'pastPerfect' , 'pastPerfectContinuous' , 'futurePerfect' , 'futurePerfectContinuous' , 'simpleFuture' , 'futureContinuous'];
export function isTense(o:any):o is Tense {
  return typeof o == 'string' && allTenses.includes(o);
}


export interface VerbTenseParse {
  kind: 'verbTense';
  verb: string;
  tense: Tense;
}
export function isVerbTenseParse(o:any):o is VerbTenseParse {
  return typeof o == 'object' &&
    o.kind == 'verbTense' &&
    isTense(o.tense) &&
    typeof o.verb == 'string'
}
export function assertIsVerbTenseParse(o:any):o is VerbTenseParse {
  if(typeof o != 'object')
    throw `VerbTenseParse must be an object, recieved: ${typeof o}`;
  if(o.kind != 'verbTense')
    throw `VerbTenseParse.kind must be 'verbTense', recieved: ${o.kind}`;
  if(!isTense(o.tense))
    throw `VerbTenseParse.tense must be a Tense, recieved: ${o.tense}`;
  if(typeof o.verb != 'string')
    throw `VerbTenseParse.verb must be a string, recieved ${typeof o.verb}`;

  // Otherwise,
  return true;
}

// PREDICATE SYNTAX GRAMMAR

export interface PredicateSyntaxParse {
  kind: 'predicateSyntax';
  verb: string;
  params: string[];
  args: NounPhraseParse[];
  tense: Tense;
}
export function isPredicateSyntaxParse(o:any):o is PredicateSyntaxParse {
  return typeof o == 'object' &&
    o.kind == 'predicateSyntax' &&
    typeof o.verb == 'string' &&
    o.params instanceof Array &&
    o.params.every((param:any) => typeof param == 'string') &&
    o.args instanceof Array &&
    o.args.every((arg:any) => isNounPhraseParse(arg)) &&
    isTense(o.tense)
}

export function assertIsPredicateSyntaxParse(o:any):o is PredicateSyntaxParse {
  if(typeof o != 'object')
    throw `PredicateSyntaxParse must be an object, recieved: ${typeof o}`;
  if(o.kind != 'predicateSyntax')
    throw `PredicateSyntaxParse.kind must be 'predicateSyntax', recieved: ${o.kind}`;
  if(!(o.params instanceof Array))
    throw `PredicateSyntaxParse.params must be an array, recieved: ${o.params}`;
  for(let param of o.params)
    if(typeof param != 'string')
      throw `Each PredicateSyntaxParse.params must be a string, recieved ${typeof param}`;
  
  if(o.args instanceof Array) {
    for(let arg of o.args)
      if(!isNounPhraseParse(arg))
        throw `Each PredicateSyntaxParse.args must be a NounPhraseParse, recieved: ${arg}`;
  } else
    throw `PredicateSyntaxParse.args must be an array, recieved: ${o.args}`;

  if(!isTense(o.tense))
    throw `PredicateSyntaxParse.tense must be a Tense, recieved: ${o.tense}`;

  // Otherwise,
  return true;
}
