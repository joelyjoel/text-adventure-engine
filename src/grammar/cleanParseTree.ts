import {AnnotatedTree, ParseTreeSymbol, ParseTree} from './Grammar';

export function isHiddenNonTerminal(sym:string) {
  return sym.slice(0,2) == '__';
}

export function isHiddenParseTreeSymbol(S: ParseTreeSymbol<string>) {
  return isHiddenNonTerminal(S.S);
}

export function cleanHiddenAnnotations(
  annotation: AnnotatedTree<any>, 
  isHidden:(S:any)=>boolean = isHiddenNonTerminal
):AnnotatedTree<any> {
  if(annotation.clean)
    // No work to be done!
    return annotation;

  const {head, body, F} = annotation;
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

  return {head, body:newBody, F, clean: true}
}

export function cleanParseTree(tree:ParseTree<string>):ParseTree<string> {
  return cleanHiddenAnnotations(tree, isHiddenParseTreeSymbol);
}
