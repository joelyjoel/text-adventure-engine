import {quickGrammar} from './quickGrammar';
import {cleanHiddenAnnotations, isHiddenNonTerminal} from './cleanParseTree';
import {Tree} from './Tree';

/** 
 * A grammara production rule in the form A -> B where A is non-terminal and B is terminal.
 */
export interface TerminalRule<TerminalSymbol, NonTerminalSymbol=TerminalSymbol> {
  head:  NonTerminalSymbol;
  body: TerminalSymbol;
  F: (terminal: TerminalSymbol) => any;
}

/**
 * A grammar production rule in the form `A -> B C` where A, B, C are all non-terminal symbols.
 */
export interface NonTerminalRule<TerminalSymbol, NonTerminalSymbol=TerminalSymbol> {
  head: NonTerminalSymbol;
  body: [NonTerminalSymbol, NonTerminalSymbol];
  F: (a: any, b:any) => any;
}

/**
 * A grammar production rule in the form A -> B where both A and B are non-terminal. This allows for a handy extension from the Chomsky Normal Form, at the cost of slightly reduced efficiency.
 */
export interface AliasRule<TerminalSymbol, NonTerminalSymbol=TerminalSymbol> {
  head: NonTerminalSymbol;
  body: NonTerminalSymbol;
  F: (a:any) => any;
}

/**
 * Shorthand type for TerminalRule|NonTerminalRule|AliasRule.
 */
export type AnyRule<TerminalSymbol, NonTerminalSymbol=TerminalSymbol> = TerminalRule<TerminalSymbol, NonTerminalSymbol>|NonTerminalRule<TerminalSymbol, NonTerminalSymbol>|AliasRule<TerminalSymbol, NonTerminalSymbol>

export interface ParseTreeTerminalSymbol<TerminalSymbol, NonTerminalSymbol> {
  from: number;
  to: number;
  S:TerminalSymbol;
}
export interface ParseTreeNonTerminalSymbol<TerminalSymbol, NonTerminalSymbol> {
  from: number;
  to: number;
  S: NonTerminalSymbol;
}

export type ParseTreeSymbol<TerminalSymbol=string, NonTerminalSymbol=TerminalSymbol>  = ParseTreeTerminalSymbol<TerminalSymbol, NonTerminalSymbol> | ParseTreeNonTerminalSymbol<TerminalSymbol, NonTerminalSymbol>

export type ParseForest<TerminalSymbol=string, NonTerminalSymbol=TerminalSymbol> = Grammar<ParseTreeTerminalSymbol<TerminalSymbol, NonTerminalSymbol>, ParseTreeNonTerminalSymbol<TerminalSymbol, NonTerminalSymbol>>;

export interface AnnotatedTree<TerminalSymbol=string, NonTerminalSymbol=TerminalSymbol> {
  head: NonTerminalSymbol,
  body: (TerminalSymbol|AnnotatedTree<TerminalSymbol, NonTerminalSymbol>)[];
  F: (...bodyEvals:any[]) => any;
  clean?: boolean;
};

export function isAnnotatedTree(x:any): x is AnnotatedTree<any> {
  return x.head && x.body && x.F
}

export type ParseTree<T=string, NT=T> = AnnotatedTree<ParseTreeTerminalSymbol<T, NT>, ParseTreeNonTerminalSymbol<T, NT>>;

export type ParseTable<TerminalSymbol, NonTerminalSymbol> = [number, NonTerminalSymbol, number][];

let uniqueNonTerminalCounter = 0;






// ### START OF CLASS PROPER

export interface GrammarConstructorOptions<TerminalSymbol, NonTerminalSymbol> {
  terminalRules?: TerminalRule<TerminalSymbol, NonTerminalSymbol>[], 
  nonTerminalRules?: NonTerminalRule<TerminalSymbol, NonTerminalSymbol>[], 
  aliasRules?:AliasRule<TerminalSymbol, NonTerminalSymbol>[], 
  startingSymbol?: NonTerminalSymbol,

  /**
   * Function that returns positive if the two given symbols (either terminal or 
   * non-terminal) are equal, `false` otherwise.
   */
  compareSymbol?: (a:TerminalSymbol|NonTerminalSymbol, b:TerminalSymbol|NonTerminalSymbol) => boolean;
  isHidden?: (S:NonTerminalSymbol) => boolean;
}

export class Grammar<TerminalSymbol=string, NonTerminalSymbol=TerminalSymbol> {
  terminalRules: TerminalRule<TerminalSymbol, NonTerminalSymbol>[];
  nonTerminalRules: NonTerminalRule<TerminalSymbol, NonTerminalSymbol>[];
  aliasRules: AliasRule<TerminalSymbol, NonTerminalSymbol>[];
  startingSymbol: NonTerminalSymbol;
  compareSymbol: (a:NonTerminalSymbol|TerminalSymbol, b:NonTerminalSymbol|TerminalSymbol) => boolean;
  isHidden: (S:NonTerminalSymbol) => boolean;

  constructor({
    terminalRules=[], 
    nonTerminalRules=[], 
    aliasRules=[],
    startingSymbol,
    compareSymbol = Object.is,
    // @ts-ignore
    isHidden = isHiddenNonTerminal,
  }:GrammarConstructorOptions<TerminalSymbol, NonTerminalSymbol>) {
    // Assign the rules
    this.terminalRules = terminalRules;
    this.nonTerminalRules = nonTerminalRules;
    this.aliasRules = aliasRules;
    this.compareSymbol = compareSymbol;
    this.isHidden = isHidden;

    if(!startingSymbol) {
      const topSymbols = this.listTopNonTerminals();
      if(topSymbols.length) {
        if(topSymbols.length == 1)
          this.startingSymbol = topSymbols[0];
        else
          console.warn('Cannot determine `startingSymbol` of grammar. Candidates:', topSymbols);
      } else
        console.warn('Cannot dermine `startingSymbol` of grammar. No candidates.');
    } else
      this.startingSymbol = startingSymbol;
  }

  /** Check whether a given string (actually an array of `TerminalSymbol`s belongs to the grammar. */
  recognise(str:TerminalSymbol[], initialTable?:ParseTable<TerminalSymbol, NonTerminalSymbol>):boolean {
    /** Table used to remember which symbols corrsespond to which part of the string
     * [fromIndex, non-terminal-symbol, toIndex]
     */
    const table:ParseTable<TerminalSymbol, NonTerminalSymbol> = [];

    /** Returns true if the table includes a particular symbol-indexes combo */
    const tableIncludes = (a:number, b:NonTerminalSymbol, c:number) => table.some(([x, y, z]) => x == a && this.compareSymbol(b, y) && c == z);

    /** Add a record to the parse table 
     * @internal */
    const addToTable = (i:number, B:NonTerminalSymbol, j:number) => {
      table.push([i, B, j]);

      // For each alias rule, head -> body, s.t. body = B
      for(let {head, body} of this.aliasRules)
        if(this.compareSymbol(body, B))
          addToTable(i, head, j);
    }

    // Initialise the table if passed an `initialTable` arg
    if(initialTable)
      for(let [i, S, j] of initialTable)
        addToTable(i, S, j)

    // For each index, j, in the string
    for(let j=1; j<=str.length; ++j) {
      // For each non-terminal rule
      for(let rule of this.terminalRules)
        // If rule's body matches string[j]
        if(rule.body == str[j-1])
          // Add a record to the table
          addToTable(j-1, rule.head, j);

      // For each i, k s.t. i < k < j   (Bad choice of symbols but its in the book..) 
      for(let i=j-1; i>=0; --i) {
        for(let k=i+1; k<=j-1; ++k)
          // For each non terminal rule, A -> B C, s.t. table includes [i, B, k] and [k, C, j]
          for(let rule of this.nonTerminalRules)
            if(tableIncludes(i, rule.body[0], k) && tableIncludes(k,rule.body[1], j))
              // Add a record to the table
              addToTable(i, rule.head, j);
      }
    }



    return tableIncludes(0, this.startingSymbol, str.length);

    // TODO: Optimise by indexing table
  }

  /** 
   * Parse the given string, creates a 'parse-forest' in the form of another 
   * context-free-grammar.
   * */
  parse(str:TerminalSymbol[], initialTable?:ParseTable<TerminalSymbol, NonTerminalSymbol>):ParseForest<TerminalSymbol, NonTerminalSymbol> {
    // Create shorthands for verbose types.
    type T = ParseTreeTerminalSymbol<TerminalSymbol, NonTerminalSymbol>;
    type NT = ParseTreeNonTerminalSymbol<TerminalSymbol, NonTerminalSymbol>;

    // Create an empty forest
    const startingSymbol = {from:0, S:this.startingSymbol, to:str.length};
    const terminalRules:TerminalRule<T, NT>[] = [];
    const nonTerminalRules:NonTerminalRule<T, NT>[] = [];
    const aliasRules:AliasRule<T, NT>[] = [];

    /** Table used to remember which symbols corrsespond to which part of the string
      * [fromIndex, symbol, toIndex]
      */
    const table:ParseTable<TerminalSymbol, NonTerminalSymbol> = []
    /** Returns true if the table includes a particular symbol-indexes combo */
    const tableIncludes = (a:number, b:NonTerminalSymbol, c:number) => table.some(([x, y, z]) => x == a && this.compareSymbol(b , y) && c == z);
    const addToTable = (i:number, B:NonTerminalSymbol, j:number) => {
      table.push([i, B, j]);

      // For each alias rule, head -> body, s.t. body = B
      for(let {head, body, F} of this.aliasRules)
        if(body == B) {
          addToTable(i, head, j);
          aliasRules.push({
            head: {from: i, S:head, to:j},
            body: {from: i, S:B, to: j},
            F,
          })
        }
    };

    // Add records from `initialTable`
    if(initialTable)
      for(let [i, S, j] of initialTable) {
        addToTable(i, S, j);
        if(i+1==j) {
          terminalRules.push({
            head: {from: i, S, to:j},
            body: {from: i, S:str[i], to:j},
            F: () => ({nonTerminal: S, terminal:str[i]}),
          })
        }
      }

    // For each index, j,  in the string.
    for(let j=1; j<=str.length; ++j) {
      // For each non-terminal rule
      for(let rule of this.terminalRules)
        // If rule's body matches string[j]
        if(this.compareSymbol(rule.body, str[j-1])) {
          // Add a record to the table
          addToTable(j-1, rule.head, j);
          const terminal = str[j-1];

          // Add a terminal rule to the forest grammar
          terminalRules.push({
            head: {from:j-1, S:rule.head, to:j}, 
            body: {from:j-1, S:terminal, to:j},
            F: () => rule.F(terminal),
          })
        }

      // For each i, k s.t. i < k < j   (Bad choice of symbols but its in the book..) 
      for(let i=j-2; i>=0; --i)
        for(let k=i+1; k<=j-1; ++k)
          // For each non terminal rule, A -> B C, s.t. table includes [i, B, k] and [k, C, j]
          for(let rule of this.nonTerminalRules)
            if(tableIncludes(i, rule.body[0], k) && tableIncludes(k,rule.body[1], j)) {
              // Add a record to the table
              addToTable(i, rule.head, j);

              // Add a non-terminal rule to the forest grammar.
              nonTerminalRules.push({
                head: {from:i, S:rule.head, to:j}, 
                body: [{from:i, S:rule.body[0], to:k}, {from:k, S:rule.body[1], to:j}],
                F: rule.F,
              });
          }
    }

    return new Grammar<T, NT>({
      terminalRules,
      nonTerminalRules,
      aliasRules,
      compareSymbol: (a:any, b:any) => {
        return a.from == b.from && a.to == b.to && this.compareSymbol(a.S, b.S);
      },
      startingSymbol,
      isHidden: S => this.isHidden(S.S),
    })

    // TODO: Optimise by indexing table
  }

  *recursiveSubstitutions(S=this.startingSymbol):Generator<TerminalSymbol[]> {
    const isRelevant = (rule:any) => this.compareSymbol(rule.head, S);

    // Yield through the terminal substitutions of S
    for(let rule of this.terminalRules.filter(isRelevant))
      yield [rule.body];

    // Recursively yield through non-terminal substitutions
    for(let rule of this.nonTerminalRules.filter(isRelevant)) {
      let [B, C] = rule.body;
      for(let cSub of this.recursiveSubstitutions(C))
        for(let bSub of this.recursiveSubstitutions(B))
          yield [...bSub, ...cSub];
    }

    // Recursively yield through alias substitutions
    for(let {body} of this.aliasRules.filter(isRelevant))
      for(let sub of this.recursiveSubstitutions(body))
        yield sub;
  }


  /**
   * Randomly generate a string from the grammar.
   */
  randomSubstitution(S = this.startingSymbol):TerminalSymbol[]{
    const isRelevant = (rule:any) => this.compareSymbol(rule.head, S);
    
    // Collect all relevent rules
    const terminalRules = this.terminalRules.filter(isRelevant);
    const nonTerminalRules = this.nonTerminalRules.filter(isRelevant);
    const aliasRules = this.aliasRules.filter(isRelevant);

    // Calculate the total number of options, `total`
    const total = terminalRules.length + nonTerminalRules.length + aliasRules.length;
    
    if(total == 0)
      // Found no matches
      throw `Found no substitutions rules for non-terminal symbol: ${S}`;

    // Randomly choose a non-negative integer below `total`
    const n = Math.floor(Math.random() * total);

    if(n < terminalRules.length)
      // `n` landed on a terminal rule
      return [terminalRules[n].body];

    else if(n < terminalRules.length + nonTerminalRules.length) {
      // n landed on a non-terminal rule
      const [a, b] = nonTerminalRules[n - terminalRules.length].body;
      return [
        ...this.randomSubstitution(a),
        ...this.randomSubstitution(b),
      ]
    } else {
      // n landed on an alias rule
      let {body} = aliasRules[n - terminalRules.length - nonTerminalRules.length];
      return this.randomSubstitution(body);
    }
  }




  * recursiveAnnotations(S=this.startingSymbol, {cleanTrees=true}={}):Generator<AnnotatedTree<TerminalSymbol, NonTerminalSymbol>> {
    if(cleanTrees) {
      for(let tree of this.recursiveAnnotations(S, {cleanTrees:false}))
        yield cleanHiddenAnnotations(tree, this.isHidden);

      return ;
    }


    const isRelevant = (rule:any) => this.compareSymbol(rule.head, S);

    // Loop through the terminal substitutions of S
    for(let rule of this.terminalRules.filter(isRelevant))
      yield {
        head:S, 
        body:[rule.body],
        F: rule.F,
      }

    // Loop through the non-terminal substitutions of S
    for(let rule of this.nonTerminalRules.filter(isRelevant)) {
      const [B, C] = rule.body;
      for(let c of this.recursiveAnnotations(C))
        for(let b of this.recursiveAnnotations(B))
          yield {
            head:S, 
            body: [b, c],
            F: rule.F,
          };
    }

    // Loop through the alias substitutions of S
    for(let rule of this.aliasRules.filter(isRelevant))
      for(let tree of this.recursiveAnnotations(rule.body))
        yield {
          head: S, 
          body: [tree],
          F: rule.F,
        };
  }

  * recursiveTrees(S=this.startingSymbol):Generator<Tree<TerminalSymbol, NonTerminalSymbol>> {
    const isRelevant = (rule:AnyRule<TerminalSymbol, NonTerminalSymbol>) => this.compareSymbol(rule.head, S);

    // Loop through the terminal substitutions of S
    for(let rule of this.terminalRules.filter(isRelevant))
      yield {
        ruleKind: 'terminal',
        rule,
        head: rule.head,
        body: rule.body,
      }

    // Loop through the non-terminal substitutions of S
    for(let rule of this.nonTerminalRules.filter(isRelevant)) {
      const [B, C] = rule.body;
      for(let b of this.recursiveTrees(B))
        for(let c of this.recursiveTrees(C))
          yield {
            ruleKind: 'nonTerminal',
            head: rule.head,
            rule,
            body: [b, c],
          }
    }

    // Loop through the alias substitutions of S
    for(let rule of this.aliasRules.filter(isRelevant))
      for(let tree of this.recursiveTrees(rule.body))
        yield {
          ruleKind: 'alias',
          rule,
          head: rule.head,
          body: tree,
        }
  }




  listAllNonTerminals() {
    const alphabet:(NonTerminalSymbol)[] = [];
    const add = (S:NonTerminalSymbol) => {
      if(!alphabet.some(H => this.compareSymbol(H, S)))
        alphabet.push(S);
    };

    for(let {head} of this.terminalRules)
      add(head);

    for(let {head, body} of this.nonTerminalRules) {
      add(head);
      add(body[0])
      add(body[1]);
    }

    for(let {head, body} of this.aliasRules) {
      add(head);
      add(body);
    }

    return alphabet;
  }

  /**
   * Get a list of all non terminal symbols that do not exist in the body of any other 
   * rules in the grammar.
   */
  listTopNonTerminals():NonTerminalSymbol[] { 
    return this.listAllNonTerminals().filter(
      S => this.nonTerminalRules.every(
        rule => (
          !this.compareSymbol(S, rule.body[0]) && 
          !this.compareSymbol(S, rule.body[1]) && 
          this.aliasRules.every(rule => !this.compareSymbol(S, rule.body))
        )
      )
    ) 
  }

  get numberOfRules() {
    return this.terminalRules.length + this.nonTerminalRules.length + this.aliasRules.length;
  }

  // #### PARSING SOURCE CODE:::

  /** Quickly create a grammar from source code string. */
  static quick(src:string): Grammar<string> {
    return quickGrammar(src);
  }

  static createUniqueNonTerminal() {
    return '__' + (uniqueNonTerminalCounter++).toString(16);
  }

  /**
   * Determine whether a string symbol is terminal or non-terminal. Non-terminal string symbols always begin with an underscore (_).
   */
  static isTerminal(sym:string) {
  return sym[0] != '_';
} 

  

  // END OF CLASS
}

