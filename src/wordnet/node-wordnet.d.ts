/**
 * !    Antonym
 * @    Hypernym
 * @i    Instance Hypernym
 * ~    Hyponym
 * ~i    Instance Hyponym
 * #m    Member holonym
 * #s    Substance holonym
 * #p    Part holonym
 * %m    Member meronym
 * %s    Substance meronym
 * %p    Part meronym
 * =    Attribute
 * +    Derivationally related form
 * ;c    Domain of synset - TOPIC
 * -c    Member of this domain - TOPIC
 * ;r    Domain of synset - REGION
 * -r    Member of this domain - REGION
 * ;u    Domain of synset - USAGE
 * -u    Member of this domain - USAGE
 */
export type NounPointerSymbol = '!'|'@'|'@i'|'~'|'~i'|'#m'|'#s'|'#p'|'%m'|'%s'|'%p'|'='|'+'|';c'|'-c'|';r'|'-r'|';u'|'-u';


/**
 * !    Antonym 
 * @    Hypernym 
 *  ~    Hyponym 
 * *    Entailment 
 * >    Cause 
 * ^    Also see 
 * $    Verb Group 
 * +    Derivationally related form         
 * ;c    Domain of synset - TOPIC 
 * ;r    Domain of synset - REGION 
 * ;u    Domain of synset - USAGE  
 */
export type VerbPointerSymbol = '!'|'@'|'~'|'*'|'>'|'^'|'$'|'+'|';c'|';r'|';u';

/**
 * !    Antonym 
 * &    Similar to 
 * <    Participle of verb 
 * \    Pertainym (pertains to noun) 
 * =    Attribute 
 * ^    Also see 
 * ;c    Domain of synset - TOPIC 
 * ;r    Domain of synset - REGION 
 * ;u    Domain of synset - USAGE
*/
export type AdjectivePointerSymbol = '!'|'&'|'<'|'\\'|'='|'^'|';c'|';r'|';u';

/**
 * !    Antonym 
 * \    Derived from adjective 
 * ;c    Domain of synset - TOPIC 
 * ;r    Domain of synset - REGION 
 * ;u    Domain of synset - USAGE
*/
export type AdverbPointerSymbol = '!'|'/'|';r'|';r'|';u';

export type PointerSymbol = NounPointerSymbol | VerbPointerSymbol | AdverbPointerSymbol | AdjectivePointerSymbol;

type PartOfSpeech = 'n'|'v'|'a'|'s'|'r';
export interface Definition {
  synsetOffset: number;

  lexFilenum: number;
  
  /** Part of speech */
  pos: PartOfSpeech;

  /** Word count */
  wCnt: number;

  lemma: 'dog';
  synonyms: string[];
  lexId: 0;
  
  /** Pointers */
  ptrs: Pointer[];
  gloss: string;
  def: string;
  exp: string[];
}

export interface Pointer {
  pointerSymbol: string;
  synsetOffset: number;
  pos: PartOfSpeech;
  sourceTarget: string;
}

