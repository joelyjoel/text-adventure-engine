import {ParseTree, isAnnotatedTree} from './Grammar'

export function executeParseTree(tree:ParseTree):any {
  return tree.F(...(
    tree.body
      .filter(treeOrSymbol => isAnnotatedTree(treeOrSymbol)) as ParseTree[])
      .map(tree => executeParseTree(tree)
  ));
}
