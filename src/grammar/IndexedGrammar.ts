import {Grammar, TerminalRule, NonTerminalRule, AliasRule, GrammarConstructorOptions, ParseTable, ParseTreeTerminalSymbol, ParseTreeNonTerminalSymbol} from './Grammar';
import {quickGrammar, RuleFunctionMapping} from './quickGrammar';



/** Extension of the Grammar class optimised with indexes */
export class IndexedGrammar extends Grammar<string, string> {
  /** Terminal rules indexed by terminal symbol. Useful for parsing. */
  terminalParseIndex: {
    [terminalSymbol: string]: TerminalRule<string>[]
  }
  /** Non-terminal rules indexed by the first non-terminal symbol, then second non terminalSymbol in the body of the rule. Useful for parsing. */
  nonTerminalParseIndex: {
    [B: string]: {
      [C:string]: NonTerminalRule<string>[];
    }
  }
  /** Alias rules indexed by the non-terminal symbol in the body of the rule. Useful for parsing. */
  aliasParseIndex: {
    [nonTerminalSymbol: string]: AliasRule<string>[];
  }

  buildIndexes():void {
    this.terminalParseIndex = {};
    this.nonTerminalParseIndex = {};
    this.aliasParseIndex = {};

    // Build terminal index
    for(let rule of this.terminalRules) {
      const T = rule.body;
      if(this.terminalParseIndex[T])
        this.terminalParseIndex[T].push(rule);
      else
        this.terminalParseIndex[T] = [rule];
    }

    // Build non-terminal parsing index.
    for(let rule of this.nonTerminalRules) {
      const [B, C] = rule.body;
      if(this.nonTerminalParseIndex[B]) {
        if(this.nonTerminalParseIndex[B][C])
          this.nonTerminalParseIndex[B][C].push(rule);
        else
          this.nonTerminalParseIndex[B][C] = [rule];
      } else
        this.nonTerminalParseIndex[B] = {[C]: [rule]};
    }

    // Build alias rule parsing index.
    for(let rule of this.aliasRules) {
      const B = rule.body;
      if(this.aliasParseIndex[B])
        this.aliasParseIndex[B].push(rule)
      else
        this.aliasParseIndex[B] = [rule];
    }

  }

  constructor(options: GrammarConstructorOptions<string>) {
    super(options);
    this.buildIndexes();
  }

  static quick(...srcs:(string|RuleFunctionMapping|Grammar<string>)[]) {
    return new IndexedGrammar(quickGrammar(...srcs));
  }

  parse(str:string[], initialTable?:ParseTable<string>) {
    // Create shorthands for verbose types.
    type T = ParseTreeTerminalSymbol<string>;
    type NT = ParseTreeNonTerminalSymbol<string>;

    // Create an empty forest
    const startingSymbol = {from:0, S:this.startingSymbol, to:str.length};
    const terminalRules:TerminalRule<T, NT>[] = [];
    const nonTerminalRules:NonTerminalRule<T, NT>[] = [];
    const aliasRules:AliasRule<T, NT>[] = [];

    /** Table used to remember which symbols corrsespond to which part of the string
      * [fromIndex, symbol, toIndex]
      */
    const table:ParseTable<string> = []
    /** Returns true if the table includes a particular symbol-indexes combo */
    const tableIncludes = (a:number, b:string, c:number) => table.some(([x, y, z]) => x == a && this.compareSymbol(b , y) && c == z);

    /** Add a record to the parsing table. */
    const addToTable = (
      i:number, 
      B:string, 
      j:number
    ) => {
      table.push([i, B, j]);

      // For each alias rule, head -> body, s.t. body = B
      for(let {head, body, F} of this.aliasParseIndex[B]) {
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
      // For each non-terminal rule NT -> T s.t. T = str[j-1]
      for(let rule of this.terminalParseIndex[str[j-1]]) {
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
    })

  }

}
