import { StatementParse } from "../parsing/parseStatement";
import { Context } from "../Context";
import { interpretParsedNounPhrase } from "./interpretNounPhrase";
import { findImperfectMappings } from "../logic/mapping";
import { VariableTable, TruthTable, Entity, Sentence } from "../logic";
import { completePartialMapping } from "../logic/VariableTable";
import { PredicateSyntax } from "../PredicateSyntax";
import { negativise } from "./negativise";

export function interpretLeafDown(parse:StatementParse, ctx:Context) {
  // First interpret the arguments.
  let fullTable = new TruthTable
  let args = parse.args.map(arg => {
    if(typeof arg == 'number' || typeof arg == 'string')
      throw "Something went wrong."
    else {
      let {returns, table=new VariableTable} = interpretParsedNounPhrase(arg, ctx);
      
      let i = table.variables.indexOf(returns)
      let mapping = completePartialMapping(
        findFirstBestIntroductoryMapping(table, ctx.truthTable)
      );
      let implementation = table.implement(...mapping)
      returns = i == -1 ? returns : mapping[i];
      fullTable.merge(implementation);
      return returns
    }
  })

  let syntax:PredicateSyntax;
  if(parse.syntax instanceof PredicateSyntax)
    syntax = parse.syntax;
  else
    throw "Expected parse syntax to be PredicateSyntax";
    
  let meaning = ctx.linkingMatrix.syntaxToMeaning({syntax: syntax, tense:parse.tense})
  
  if(!meaning)
    throw "Meaningless syntax";

  if(parse.negative)
    meaning.truth = negativise(meaning.truth)

  let mainSentence = new Sentence(meaning.predicate, ...args)

  fullTable.assign(mainSentence, meaning.truth);

  return fullTable

  // TODO: Interpret the sentence overall, add to FullTable and return
}

function findFirstBestIntroductoryMapping(claim:VariableTable, onto:TruthTable) {
  for(let {mapping} of findImperfectMappings(claim, onto)) {
    let implementation = claim.implementPartialMapping(mapping);
    if(!onto.hasContradictionsWith(implementation))
      return mapping
    
  }

  // Otherwise create a completely introductory mapping
  let mapping = claim.variables.map(x => new Entity)
  return mapping
}