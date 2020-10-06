import {TerminalRule, NonTerminalRule, AliasRule, ParseTreeTerminalSymbol, ParseTreeNonTerminalSymbol} from './Grammar';

export type Tree<
  /** Terminal symbol */
  T, 
  /** Non-terminal symbol */
  NT=T,

  /** 
   * Grammar rule terminal symbol.
   * Trees include references to the grammar rules by which they were 
   * constructed. In the case of mapped trees, the terminal and non 
   * terminal symbols in the rules do not match the symbols in the tree.
   */
  GrammarTerminal = T, 
  /** 
   * Grammar rule non terminal symbol.
   * Trees include references to the grammar rules by which they were 
   * constructed. In the case of mapped trees, the terminal and non 
   * terminal symbols in the rules do not match the symbols in the tree.
   */
  GrammarNonTerminal = NT,
> = {
  ruleKind: 'terminal';
  rule: TerminalRule<GrammarTerminal, GrammarNonTerminal>;
  head: NT;
  body: T;
} | {
  ruleKind: 'nonTerminal';
  rule: NonTerminalRule<GrammarTerminal, GrammarNonTerminal>;
  head: NT;
  body: [Tree<T, NT, GrammarTerminal, GrammarNonTerminal>, Tree<T, NT, GrammarTerminal, GrammarNonTerminal>];
} | {
  ruleKind: 'alias';
  rule: AliasRule<GrammarTerminal, GrammarNonTerminal>;
  head: NT;
  body: Tree<T, NT, GrammarTerminal, GrammarNonTerminal>;
}

export function evaluateTree<TerminalSymbol>(tree:Tree<TerminalSymbol>):any {
  if(tree.ruleKind == 'terminal')
    return tree.rule.F(tree.body);
  
  else if(tree.ruleKind == 'nonTerminal')
    return tree.rule.F(
      evaluateTree(tree.body[0]),
      evaluateTree(tree.body[1])
    );

  else if(tree.ruleKind == 'alias')
    return tree.rule.F(
      evaluateTree(tree.body)
    );

  else
    throw "Could not evaluate tree: " + JSON.stringify(tree, null, 4);
}

export function flattenTree<TerminalSymbol>(tree:Tree<TerminalSymbol>):TerminalSymbol[] {
  
  if(tree.ruleKind == 'terminal')
    return [tree.body];
  
  else if(tree.ruleKind == 'nonTerminal')
    return [...flattenTree(tree.body[0]), ...flattenTree(tree.body[1])];

  else if(tree.ruleKind == 'alias')
    return flattenTree(tree.body);

  else
    throw "Cannot flatten tree because of invalid `ruleKind`: " + tree
}


export function mapTree<T, NT, GT, GNT, T2, NT2>(
  tree:Tree<T, NT, GT, GNT>, 
  mapTerminal: (a:T) => T2,
  mapNonTerminal: (nt:NT) => NT2,
):Tree<T2, NT2, GT, GNT> { 
  if(tree.ruleKind == 'terminal')
    return {
      rule: tree.rule,
      ruleKind: tree.ruleKind,
      head: mapNonTerminal(tree.head),
      body: mapTerminal(tree.body),
    }

  else if(tree.ruleKind == 'nonTerminal')
    return {
      rule: tree.rule,
      ruleKind: tree.ruleKind,
      head: mapNonTerminal(tree.head),
      body: [
        mapTree(tree.body[0], mapTerminal, mapNonTerminal),
        mapTree(tree.body[1], mapTerminal, mapNonTerminal),
      ],
    }

  else if(tree.ruleKind == 'alias')
    return {
      rule: tree.rule,
      ruleKind: tree.ruleKind,
      head: mapNonTerminal(tree.head),
      body: mapTree(tree.body, mapTerminal, mapNonTerminal),
    }

  else
    throw "Tree has unexpected rule-kind:" + JSON.stringify(tree);

}

export type ParseTree<T, NT, GT=T, GNT=NT > = Tree<ParseTreeTerminalSymbol<T, NT>, ParseTreeNonTerminalSymbol<T, NT>, GT, GNT>;

export function rewindParseTreeSymbols<T, NT, GT, GNT>(parseTree:ParseTree<T, NT, GT, GNT>):Tree<T, NT, GT, GNT> {
  return mapTree(
    parseTree,
    S => S.S,
    S => S.S,
  );
}
