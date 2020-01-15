import { Entity } from "../logic";
import { Context } from "../Context";
import { EntitySyntaxComposeOptions, EntitySyntax } from "../EntitySyntax";

export function composeEntity(
  e:Entity, 
  ctx:Context, 
  options:Partial<EntitySyntaxComposeOptions> = {}
) {
  let syntax = EntitySyntax.forEntity(e, ctx);
  return syntax.compose(options);
}