import { interpretNounPhrase } from "./interpretNounPhrase";
import { Context } from "../Context";
import { findMappings } from "../logic/mapping";

export function resolveNounPhrase(
  /** An interpretation of a noun-phrase */
  str: string, 
  ctx: Context
) {
  let claim = interpretNounPhrase(str, ctx)
  if(!claim)
    return null;
  
  // First, look for a match in the existing truth table
  if(ctx.truthTable) {
    let mappings = findMappings(claim, ctx.truthTable)
    
  }

}

