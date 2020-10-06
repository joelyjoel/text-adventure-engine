import {GrammarRuleFunction} from './FunctionGrammar';

export interface Rule {
  src?: string;
  id?: number|string;
  ruleFunction?: GrammarRuleFunction;
}

export interface TerminalRule<TerminalSymbol, NonTerminalSymbol=TerminalSymbol> extends Rule {
  head: NonTerminalSymbol;
  body: TerminalSymbol;
}

export interface NonTerminalRule<TerminalSymbol, NonTerminalSymbol=TerminalSymbol> extends Rule {
  head: NonTerminalSymbol;
  body: [NonTerminalSymbol, NonTerminalSymbol];
}
  

/** A context free grammar in chomsky normal form */
export interface ContextFreeGrammar<TerminalSymbol=string, NonTerminalSymbol=TerminalSymbol> {
  nonTerminalRules: NonTerminalRule<TerminalSymbol, NonTerminalSymbol>[],
  terminalRules: TerminalRule<TerminalSymbol, NonTerminalSymbol>[];
  startingSymbol?: NonTerminalSymbol;
}




/** 
 * Determine if a given grammar recognises a given string. Implementation of the 
 * CKY algorithm. See p108 of The Handbok of Computational Linguistics and Natural 
 * Language Processing.
 */
export function cfgRecognise(grammar: ContextFreeGrammar<string>, str: string[]):boolean {
  if(!grammar.startingSymbol)
    throw "Cannot recognise for a grammar with no `startingSymbol` property";

  /** Table used to remember which symbols corrsespond to which part of the string
   * [fromIndex, symbol, toIndex]
   */
  const table:[number, string, number][] = [];

  /** Returns true if the table includes a particular symbol-indexes combo */
  const tableIncludes = (a:number, b:string, c:number) => table.some(([x, y, z]) => x == a && b == y && c == z);
  
  // For each index, j,  in the string.
  for(let j=1; j<=str.length; ++j) {
    // For each non-terminal rule
    for(let rule of grammar.terminalRules)
      // If rule's body matches string[j]
      if(rule.body == str[j-1])
        // Add a record to the table
        table.push([j-1, rule.head, j]);

    // For each i, k s.t. i < k < j   (Bad choice of symbols but its in the book..) 
    for(let i=j-2; i>=0; --i)
      for(let k=i+1; k<=j-1; ++k)
        // For each non terminal rule, A -> B C, s.t. table includes [i, B, k] and [k, C, j]
        for(let rule of grammar.nonTerminalRules)
          if(tableIncludes(i, rule.body[0], k) && tableIncludes(k,rule.body[1], j))
            // Add a record to the table
            table.push([i, rule.head, j]);
  }

  // If table includes the starting symbol for whole string
  if(grammar.startingSymbol && tableIncludes(0, grammar.startingSymbol, str.length))
    return true;
  else
    return false;

  // TODO: Could be optimised by indexing `table`
}

export interface ParseTreeSymbol {from:number, to:number, S:string}

export function cfgParse(grammar: ContextFreeGrammar<string>, str: string[]) {
  const startingSymbol = grammar.startingSymbol;
  if(!startingSymbol)
    throw "Cannot parse for a grammar with no `startingSymbol` property";

  /** Table used to remember which symbols corrsespond to which part of the string
   * [fromIndex, symbol, toIndex]
   */
  const table:[number, string, number][] = [];

  /** Returns true if the table includes a particular symbol-indexes combo */
  const tableIncludes = (a:number, b:string, c:number) => table.some(([x, y, z]) => x == a && b == y && c == z);

  const forest:ContextFreeGrammar<ParseTreeSymbol> = {
    startingSymbol: {from:0, S:startingSymbol, to:str.length},
    terminalRules: [],
    nonTerminalRules: [],
  } 

  // For each index, j,  in the string.
  for(let j=1; j<=str.length; ++j) {
    // For each non-terminal rule
    for(let rule of grammar.terminalRules)
      // If rule's body matches string[j]
      if(rule.body == str[j-1]) {
        // Add a record to the table
        table.push([j-1, rule.head, j]);

        // Add a terminal rule to the forest grammar
        forest.terminalRules.push({
          id: rule.id,
          head: {from:j-1, S:rule.head, to:j}, 
          body: {from:j-1, S:str[j-1], to:j},
        })
      }

    // For each i, k s.t. i < k < j   (Bad choice of symbols but its in the book..) 
    for(let i=j-2; i>=0; --i)
      for(let k=i+1; k<=j-1; ++k)
        // For each non terminal rule, A -> B C, s.t. table includes [i, B, k] and [k, C, j]
        for(let rule of grammar.nonTerminalRules)
          if(tableIncludes(i, rule.body[0], k) && tableIncludes(k,rule.body[1], j)) {
            // Add a record to the table
            table.push([i, rule.head, j]);

            // Add a non-terminal rule to the forest grammar.
            forest.nonTerminalRules.push({
              id: rule.id,
              head: {from:i, S:rule.head, to:j}, 
              body: [{from:i, S:rule.body[0], to:k}, {from:k, S:rule.body[1], to:j}]
            });
        }
  }

  return forest;

  // TODO: Could be optimised by indexing `table`
}

export function parseTreeSymbolCompare(A:ParseTreeSymbol, B:ParseTreeSymbol) {
  return A.from == B.from && A.to == B.to && A.S == B.S;
}

/** Get a list of all non-terminal substitutions for a given nonTerminalSymbol */
export function getNonTerminalSubstitutions(grammar:ContextFreeGrammar<any>, nonTerminalSymbol:any, compareSymbol=Object.is) {
    return grammar.nonTerminalRules
        .filter(rule => compareSymbol(rule.head, nonTerminalSymbol))
        //.map(rule => rule.body);
}

export function getTerminalSubstitutions(grammar:ContextFreeGrammar<any>, nonTerminalSymbol:any, compareSymbol=Object.is) {
    return grammar.terminalRules
        .filter(rule => compareSymbol(rule.head, nonTerminalSymbol))
        //.map(rule => rule.body)
}

export function * recursiveSubstitutions(grammar:ContextFreeGrammar<any>, S=grammar.startingSymbol, compareSymbol=Object.is):Generator<any[]> {
    // Yield through terminal substitutions for S
    const terminalSubstitutions = getTerminalSubstitutions(grammar, S, compareSymbol);
    for(let rule of terminalSubstitutions)
        yield [rule.body];

    const nonTerminalSubstitutions = getNonTerminalSubstitutions(grammar, S, compareSymbol);
    for(let rule of nonTerminalSubstitutions) {
        let [B, C] = rule.body
        let cSubs = recursiveSubstitutions(grammar, C, compareSymbol);
        for(let cSub of cSubs) {
            let bSubs = recursiveSubstitutions(grammar, B, compareSymbol);
            for(let bSub of bSubs) {
                yield [...bSub, ...cSub];
            }

        }
    }
}

export interface AnnotatedTree<Terminal=string, NonTerminal=Terminal> {
  head: NonTerminal,
  body: (Terminal|AnnotatedTree<Terminal, NonTerminal>)[];
  ruleId?: number|string;
}



export function * recursiveAnnotations(
  grammar:ContextFreeGrammar<any>, 
  S=grammar.startingSymbol, 
  compareSymbol=Object.is,
):Generator<AnnotatedTree> {
  // Loop through the terminal substitutions
  const terminalSubstitutions = getTerminalSubstitutions(grammar, S, compareSymbol);
  for(let rule of terminalSubstitutions)
    yield {head: S, body:[rule.body], ruleId:rule.id}

  // Now loop through the non-terminal rules with S as head (S -> B C)
  const subs = getNonTerminalSubstitutions(grammar, S, compareSymbol);
  for(let rule of subs) {
    let [B, C] = rule.body

    for(let cSub of recursiveAnnotations(grammar, C, compareSymbol)) 
      for(let bSub of recursiveAnnotations(grammar, B, compareSymbol)) 
        yield {head:S, ruleId:rule.id, body: [bSub, cSub]};
  }
}

export function isHiddenNonTerminal(sym:string) {
  return sym.slice(0,2) == '__';
}

export function cleanHiddenAnnotations(
  annotation: AnnotatedTree<any>, 
  isHidden:(S:any)=>boolean=isHiddenNonTerminal
):AnnotatedTree<any> {
  const {head, body, ruleId} = annotation;
  const newBody = [];
  for(let item of body) {
    if(typeof item == 'object' && item.head && item.body) {
      // Item is a non-terminal anotation
      if(isHidden(item.head)) 
        newBody.push(...cleanHiddenAnnotations(item, isHidden).body)
      else 
        newBody.push(cleanHiddenAnnotations(item, isHidden));
    } else
      // item is a terminal (?) symbol
      newBody.push(item);
  }

  return {head, body:newBody, ruleId}
}


export function stringifyAnnotation(annotation:AnnotatedTree|string):string {
  if(typeof annotation == 'string')
    return `"${annotation}"`;
  else {
    const {head, body} = annotation;
    return `[${head}: ${body.map(stringifyAnnotation).join(' ')} ]`
  }
}

export function randomSubstitution(
  grammar:ContextFreeGrammar<any>, 
  S=grammar.startingSymbol, 
  compareSymbol=Object.is
):any[] {
  const terminalSubstitutions = getTerminalSubstitutions(grammar, S, compareSymbol);
  const nonTerminalSubstitutions = getNonTerminalSubstitutions(grammar, S, compareSymbol);

  if(Math.random() * (terminalSubstitutions.length + nonTerminalSubstitutions.length) < terminalSubstitutions.length)
    // Return a terminal substitution
    return [terminalSubstitutions[Math.floor(Math.random()*terminalSubstitutions.length)].body]

  else {
    let sub = nonTerminalSubstitutions[Math.floor(Math.random()*nonTerminalSubstitutions.length)].body;
    return [
      ...randomSubstitution(grammar, sub[0], compareSymbol),
      ...randomSubstitution(grammar, sub[1], compareSymbol),
    ]
  }
  
}

