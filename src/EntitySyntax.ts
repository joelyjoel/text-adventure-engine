import { Noun } from "./Noun";
import { Adjective } from "./Adjective";

/** Defines ways to represent an adjective  */
export class EntitySyntax {

  /** A list of nouns which could be used to describe the entity. */
  nouns: Noun[];
  /** A list of adjectives which could be used to describe the entity. */
  adjectives: Adjective[];
}