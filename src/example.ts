
import { PredicateSyntax } from "./PredicateSyntax";

let syntax = new PredicateSyntax('live', ['subject', 'in', 'on'])
console.log("Syntax: ", syntax);
console.log("syntax.parse('the boy lives in the warm dutch barge on the river Lee')")
syntax.parse('the boy lives in the warm dutch barge on the river Lee');
syntax.parse('the boy lives on the river Lee in the warm dutch barge')