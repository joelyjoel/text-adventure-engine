import {quickGrammar, RuleFunctionMapping} from './quickGrammar';
import {Tree} from './Tree';

/** 
 * A grammara production rule in the form A -> B where A is non-terminal and B is terminal.
 */
export interface TerminalRule<TerminalSymbol, NonTerminalSymbol=TerminalSymbol> {
  head:  NonTerminalSymbol;
  body: TerminalSymbol;
  F: (terminal: TerminalSymbol) => any;
}

/** Test whether an object is a valid TerminalRule. */
export function isTerminalRule<T, NT>(
  o:any,
  isTerminalSymbol: (S:any) => S is T,
  isNonTerminalSymbol: (S:any) => S is NT,
):o is TerminalRule<T, NT> {
  return isNonTerminalSymbol(o.head) && isTerminalSymbol(o.body) && typeof o.F == 'function';
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
 * Test whether an object is a valid NonTerminalRule.
 */
export function isNonTerminalRule<T, NT>(
  o:any,
  isTerminalSymbol: (S:any) => S is T,
  isNonTerminalSymbol: (S:any) => S is NT,
):o is NonTerminalRule<T, NT> {
  return isNonTerminalSymbol(o.head) 
    && o.body instanceof Array 
    && o.body.length == 2
    && isNonTerminalSymbol(o.body[0])
    && isNonTerminalSymbol(o.body[1])
    && typeof o.F == 'function';
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
 * Test whether an object is a valid AliasRule.
 */
export function isAliasRule<T, NT>(
  o: any,
  isTerminalSymbol: (S:any) => S is T,
  isNonTerminalSymbol: (S:any) => S is NT,
) {
  return isNonTerminalSymbol(o.head)
    && isNonTerminalSymbol(o.body)
    && typeof o.F == 'function';
}


/**
 * Shorthand type for TerminalRule|NonTerminalRule|AliasRule.
 */
export type AnyRule<TerminalSymbol, NonTerminalSymbol=TerminalSymbol> = TerminalRule<TerminalSymbol, NonTerminalSymbol>|NonTerminalRule<TerminalSymbol, NonTerminalSymbol>|AliasRule<TerminalSymbol, NonTerminalSymbol>

export interface ParseTreeTerminalSymbol<TerminalSymbol, NonTerminalSymbol=TerminalSymbol> {
  from: number;
  to: number;
  S:TerminalSymbol;
}
export interface ParseTreeNonTerminalSymbol<TerminalSymbol, NonTerminalSymbol=TerminalSymbol> {
  from: number;
  to: number;
  S: NonTerminalSymbol;
}

export type ParseTreeSymbol<TerminalSymbol=string, NonTerminalSymbol=TerminalSymbol>  = ParseTreeTerminalSymbol<TerminalSymbol, NonTerminalSymbol> | ParseTreeNonTerminalSymbol<TerminalSymbol, NonTerminalSymbol>

export type ParseForest<TerminalSymbol=string, NonTerminalSymbol=TerminalSymbol> = Grammar<ParseTreeTerminalSymbol<TerminalSymbol, NonTerminalSymbol>, ParseTreeNonTerminalSymbol<TerminalSymbol, NonTerminalSymbol>>;

export type ParseTable<TerminalSymbol, NonTerminalSymbol=TerminalSymbol> = [
  number, 
  NonTerminalSymbol, 
  number, 
  ((...args:any) => any)?
][];

let uniqueNonTerminalCounter = 0;






// ### START OF CLASS PROPER

export interface GrammarConstructorOptions<TerminalSymbol, NonTerminalSymbol=TerminalSymbol> {
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
  /** 
   * Suppresses console warnings.
   * */
  pleaseBeQuiet?: boolean;

  /** 
   * Optionally provide a type guard function for terminal symbols to help debuging the grammar. 
   * */
  isTerminalSymbol?: (o:any) => o is TerminalSymbol;
  /** 
   * Optionally provide a type guard function for non-terminal symbols to help debuging the grammar. 
   * */
  isNonTerminalSymbol?: (o: any) => o is NonTerminalSymbol;


  /**
   * function to convert any grammar symbol into a string
   */
  stringifySymbol?: (S: TerminalSymbol|NonTerminalSymbol) => string;

  /**
   * function converting terminal symbols to strings
   */
  stringifyTerminalSymbol?: (S: TerminalSymbol) => string;

  /**
   * Function to convert non-terminal symbols to strings
   */
  stringifyNonTerminalSymbol?: (NT: NonTerminalSymbol) => string;
}

export class Grammar<TerminalSymbol=string, NonTerminalSymbol=TerminalSymbol> {
  terminalRules: TerminalRule<TerminalSymbol, NonTerminalSymbol>[];
  nonTerminalRules: NonTerminalRule<TerminalSymbol, NonTerminalSymbol>[];
  aliasRules: AliasRule<TerminalSymbol, NonTerminalSymbol>[];
  startingSymbol: NonTerminalSymbol;
  compareSymbol: (a:NonTerminalSymbol|TerminalSymbol, b:NonTerminalSymbol|TerminalSymbol) => boolean;
  isHidden: (S:NonTerminalSymbol) => boolean;
  beQuiet: boolean;
  isTerminalSymbol: (S: any) => S is TerminalSymbol;
  isNonTerminalSymbol: (S: any) => S is NonTerminalSymbol;
  stringifyTerminalSymbol: (S: TerminalSymbol) => string
  stringifyNonTerminalSymbol: (S:NonTerminalSymbol) => string;

  constructor({
    terminalRules=[], 
    nonTerminalRules=[], 
    aliasRules=[],
    startingSymbol,
    compareSymbol = Object.is,
    // @ts-ignore
    isHidden = (S:any) => /^__/.test(S),
    pleaseBeQuiet=false,
    // @ts-ignore
    isTerminalSymbol = () => {throw "No type guard defined for terminal symbols."}, 
    // @ts-ignore
    isNonTerminalSymbol = () => {throw "No type guard defined for non-terminal symbols."},

    // Stringification
    stringifySymbol = S => JSON.stringify(S),
    stringifyTerminalSymbol = stringifySymbol,
    stringifyNonTerminalSymbol = stringifySymbol,

  }:GrammarConstructorOptions<TerminalSymbol, NonTerminalSymbol>) {
    // Assign the rules
    this.terminalRules = terminalRules;
    this.nonTerminalRules = nonTerminalRules;
    this.aliasRules = aliasRules;
    this.compareSymbol = compareSymbol;
    this.isHidden = isHidden;
    this.beQuiet = pleaseBeQuiet
    this.isTerminalSymbol = isTerminalSymbol;
    this.isNonTerminalSymbol = isNonTerminalSymbol;

    this.stringifyTerminalSymbol = stringifyTerminalSymbol;
    this.stringifyNonTerminalSymbol = stringifyNonTerminalSymbol;

    if(!startingSymbol) {
      const topSymbols = this.listTopNonTerminals();
      if(topSymbols.length) {
        if(topSymbols.length == 1)
          this.startingSymbol = topSymbols[0];
        else if(!this.beQuiet)
          console.warn('Cannot determine `startingSymbol` of grammar. Candidates:', topSymbols);
      } else if(!this.beQuiet)
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
  parse(
    str:TerminalSymbol[], 
    initialTable?:ParseTable<TerminalSymbol, NonTerminalSymbol>
  ):ParseForest<TerminalSymbol, NonTerminalSymbol> {
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

    /** Add a record to the parsing table. */
    const addToTable = (
      i:number, 
      B:NonTerminalSymbol, 
      j:number
    ) => {
      // Skip if record is already in table.
      if(tableIncludes(i, B, j))
        return ;
      
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
      for(let [i, S, j, F] of initialTable) {
        addToTable(i, S, j);
        if(i+1==j) {
          terminalRules.push({
            head: {from: i, S, to:j},
            body: {from: i, S:str[i], to:j},
            F: F || (() => str[i]),
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
      compareSymbol: (a:T|NT, b:T|NT) => {
        return a.from == b.from && a.to == b.to && this.compareSymbol(a.S, b.S);
      },
      isTerminalSymbol: (S:any):S is T => {
        return typeof S =='object' &&
          typeof S.from == 'number'
          && S.from >= 0
          && typeof S.to == 'number'
          && S.to >= 0
          && this.isTerminalSymbol(S.S);
      },

      isNonTerminalSymbol: (S:any):S is NT => {
        return typeof S == 'object' &&
          typeof S.from == 'number' &&
          typeof S.to == 'number' &&
          S.from >= 0 &&
          S.to >= 0 &&
          this.isNonTerminalSymbol(S.S);
      },
      
      startingSymbol,
      isHidden: S => this.isHidden(S.S),

      stringifyTerminalSymbol: S => this.stringifyTerminalSymbol(S.S),
      stringifyNonTerminalSymbol: S => this.stringifyNonTerminalSymbol(S.S),
    })
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

  stringifyTree(tree: Tree<TerminalSymbol, NonTerminalSymbol, any, any>):string {
    if(tree.ruleKind == 'terminal') {
      if(this.isHidden(tree.head))
        // Head symbol is hidden, just print body
        return this.stringifyTerminalSymbol(tree.body);
      else
        return `[${
          this.stringifyNonTerminalSymbol(tree.head)
        } ${this.stringifyTerminalSymbol(tree.body)}]`;
    } else if(tree.ruleKind == 'nonTerminal') {
      if(this.isHidden(tree.head))
        return `${this.stringifyTree(tree.body[0])} ${this.stringifyTree(tree.body[1])}`;
      else
        return `[${
          this.stringifyNonTerminalSymbol(tree.head)
        } ${this.stringifyTree(tree.body[0])} ${this.stringifyTree(tree.body[1])}]`
    } else if(tree.ruleKind == 'alias') {
      if(this.isHidden(tree.head))
        return this.stringifyTree(tree.body);
      else 
        return `[${this.stringifyNonTerminalSymbol(tree.head)} ${this.stringifyTree(tree.body)}]`;
    } else
      // @ts-ignore
      throw `Unexpected rule kind in tree: ${tree.ruleKind}`;
  }

  /**
   * Test whether two trees are equal.
   */
  compareTrees(
    oak: Tree<TerminalSymbol, NonTerminalSymbol, any, any>, 
    cedar: Tree<TerminalSymbol, NonTerminalSymbol, any, any>
  ):boolean {
    // Check trees have same rule kind
    if(oak.ruleKind == 'terminal')
      return cedar.ruleKind == 'terminal' && this.compareSymbol(oak.head, cedar.head) && this.compareSymbol(oak.body, cedar.body);

    else if(oak.ruleKind == 'nonTerminal')
      return cedar.ruleKind == 'nonTerminal' && this.compareSymbol(oak.head, cedar.head) && this.compareTrees(oak.body[0], cedar.body[0]) && this.compareTrees(oak.body[1], cedar.body[1]);

    else if(oak.ruleKind == 'alias')
      return cedar.ruleKind == 'alias' && this.compareSymbol(oak.head, cedar.head) && this.compareTrees(oak.body, cedar.body);

    else
      throw "Tree has unexpected rule kind: "+JSON.stringify(oak);
  }


  * iterateRules() {
    for(let rule of this.terminalRules)
      yield rule;
    for(let rule of this.nonTerminalRules)
      yield rule;
    for(let rule of this.aliasRules)
      yield rule;
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

  /**
   * Get a list of all non-terminal symbols that do not exist as the head of any rule.
   */
  listLooseNonTerminals():NonTerminalSymbol[] {
    const list = [];
    for(let S of this.listAllNonTerminals()) {
      let loose = true;
      for(let rule of this.iterateRules()) {
        if(this.compareSymbol(S, rule.head)) {
          loose = false
          break;
        }
      }
      if(loose)
        list.push(S)
    }

    return list;
  }

  assertNoLooseNonTerminals() {
    const list = this.listLooseNonTerminals();
    if(list.length)
      throw `Grammar has ${list.length} loose non-terminal symbols: ${list.join(', ')}`;
  }

  /**
   * Throws an exception i the grammar contains two or more rules that are identical.
   */
  assertNoDuplicateRules() {
    this.assertNoDuplicateTerminalRules();
    this.assertNoDuplicateNonTerminalRules();
    this.assertNoDuplicateAliasRules();
  }

  /**
   * Throw an exception if the grammar contains two or more terminal rules that are identical.
   */
  assertNoDuplicateTerminalRules() {
    // Assert no duplicate terminal rules
    for(let i=0; i<this.terminalRules.length; ++i) {
      const a = this.terminalRules[i];
      for(let j=i+1; j<this.terminalRules.length; ++j) {
        const b = this.terminalRules[j];

        if(this.compareTerminalRules(a, b)) {
          if(a.F == b.F)
            throw `Grammar has duplicate TERMINAL rules with different evaluation functions. ${this.stringifyTerminalRule(a)}`;
          else
            throw `Grammar has duplicate TERMINAL rule: ${this.stringifyTerminalRule(a)}`;
        }
      }
    }
  }

  /**
   * Throws an exepction if the grammar contains two or more non-terminal rules that are identical.
   */
  assertNoDuplicateNonTerminalRules() {
    for(let i=0; i<this.nonTerminalRules.length; ++i) {
      const a = this.nonTerminalRules[i];
      for(let j=i + 1; j < this.nonTerminalRules.length; ++j) {
        const b = this.nonTerminalRules[j];

        if(this.compareNonTerminalRules(a, b)) {
          if(a.F == b.F)
            throw `Grammar has duplicate NON-TERMINAL rules with different evaluation functions: ${this.stringifyNonTerminalRule(a)}`
          else
            throw `Grammar has duplicate NON-TERMINAL rules: ${this.stringifyNonTerminalRule(a)}`;
        }
        
      }
    }
  }

  /**
   * Throws an exception if the grammar contains two or more alias rules that are identical
   */
  assertNoDuplicateAliasRules() {
    for(let i=0; i<this.aliasRules.length; ++i) {
      const a = this.aliasRules[i];
      for(let j=i+1; j<this.aliasRules.length; ++j) {
        const b = this.aliasRules[j];

        if(this.compareAliasRules(a, b)) {
          if(a.F == b.F)
            throw `Grammar has duplicate ALIAS rules with different evaluation functions: ${this.stringifyAliasRule(a)} \n\n\tFirst function: ${a.F.toString()}\n\n\tSecondFunction: ${b.F.toString()}`;
          else
            throw `Grammar has duplicate ALIAS rules: ${this.stringifyAliasRule(a)}`;
        }
      }
    }
  }

  /**
   * Check if two terminal rules are the same.
   */
  compareTerminalRules(a:TerminalRule<TerminalSymbol, NonTerminalSymbol>, b:TerminalRule<TerminalSymbol, NonTerminalSymbol>):boolean {
    return this.compareSymbol(a.head, b.head) && 
      this.compareSymbol(a.body, b.body);
    // SHould this also compare eval functions?
  }

  /**
   * Check if two non-terminal rules are the same.
   */
  compareNonTerminalRules(
    a:NonTerminalRule<TerminalSymbol, NonTerminalSymbol>, 
    b:NonTerminalRule<TerminalSymbol, NonTerminalSymbol>
  ) {
    return this.compareSymbol(a.head, b.head) && 
      this.compareSymbol(a.body[0], b.body[0]) && 
      this.compareSymbol(a.body[1], b.body[1]);
  }

  /**
   * Check if two alias rules are the same.
   */
  compareAliasRules(
    a:AliasRule<TerminalSymbol, NonTerminalSymbol>,
    b: AliasRule<TerminalSymbol, NonTerminalSymbol>
  ) {
    return this.compareSymbol(a.head, b.head) &&
      this.compareSymbol(a.body, b.body);
  }

  stringifyTerminalRule(rule:TerminalRule<TerminalSymbol, NonTerminalSymbol>) {
    return `${
      this.stringifyNonTerminalSymbol(rule.head)
    } -> ${this.stringifyTerminalSymbol(rule.body)}`;
  }

  stringifyNonTerminalRule(rule:NonTerminalRule<TerminalSymbol, NonTerminalSymbol>) {
    return `${
      this.stringifyNonTerminalSymbol(rule.head)
    } -> ${
      this.stringifyNonTerminalSymbol(rule.body[0])
    } ${
      this.stringifyNonTerminalSymbol(rule.body[1])
    }`;
  }

  stringifyAliasRule(rule:AliasRule<TerminalSymbol, NonTerminalSymbol>) {
    return `${
      this.stringifyNonTerminalSymbol(rule.head)
    } -> ${
      this.stringifyNonTerminalSymbol(rule.body)
    }`;
  }

  get numberOfRules() {
    return this.terminalRules.length + this.nonTerminalRules.length + this.aliasRules.length;
  }

  checkRules() {
    if(!this.isNonTerminalSymbol(this.startingSymbol))
      throw "Starting symbol is not valid: " + JSON.stringify(this.startingSymbol);

    for(let rule of this.terminalRules)
      if(!isTerminalRule(rule, this.isTerminalSymbol, this.isNonTerminalSymbol)) {
        throw "Rule is not valid: " + JSON.stringify(rule)
      }
    for(let rule of this.nonTerminalRules)
      if(!isNonTerminalRule(rule, this.isTerminalSymbol, this.isNonTerminalSymbol))
        throw "Found invalid non-terminal rule: " + JSON.stringify(rule);

    for(let rule of this.aliasRules)
      if(!isAliasRule(rule, this.isTerminalSymbol, this.isNonTerminalSymbol))
        throw "Found invalid alias rule: " + JSON.stringify(rule);
  }

  // #### PARSING SOURCE CODE:::

  /** Quickly create a grammar from source code string. */
  static quick(...srcs:(string|RuleFunctionMapping|Grammar)[]): Grammar<string> {
    return new Grammar(quickGrammar(...srcs));
  }

  /** 
   * Combine a number of grammars, assuming the starting symbol of the first grammar.
   * */
  static merge<T, NT>(...grammars:Grammar<T, NT>[]):Grammar<T, NT> {
    const terminalRules:TerminalRule<T, NT>[] = [],
      nonTerminalRules: NonTerminalRule<T, NT>[] = [],
      aliasRules: AliasRule<T, NT>[] = [];

    for(let g of grammars) {
      terminalRules.push(...g.terminalRules);
      nonTerminalRules.push(...g.nonTerminalRules);
      aliasRules.push(...g.aliasRules);
    }

    const {startingSymbol, compareSymbol, isHidden, isTerminalSymbol, isNonTerminalSymbol} = grammars[0];
    return new Grammar({
      terminalRules,
      nonTerminalRules,
      aliasRules,
      startingSymbol,
      compareSymbol,
      isHidden,
      isTerminalSymbol,
      isNonTerminalSymbol,
    });

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

