import {TerminalRule, NonTerminalRule, AliasRule} from './Grammar';

export type Tree<T, NT=T> = {
  ruleKind: 'terminal';
  rule: TerminalRule<T, NT>;
  head: NT;
  body: T;
} | {
  ruleKind: 'nonTerminal';
  rule: NonTerminalRule<T, NT>;
  head: NT;
  body: [Tree<T, NT>, Tree<T, NT>];
} | {
  ruleKind: 'alias';
  rule: AliasRule<T, NT>;
  head: NT;
  body: Tree<T, NT>;
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
