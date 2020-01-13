import { Dictionary } from "../Dictionary";

/** Structured data returned by a parse function */
export interface Parse {
  /** The index where this feature starts */
  readonly from: number;
  /** The index where this feature ends. */
  readonly to: number; 

  /** The original (unparsed) string */
  readonly str: string;

  syntaxKind: string;

  /** The dictionary used to parse the string. */
  readonly dicitonary?: Dictionary
}