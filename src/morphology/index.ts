export interface Morphology {
  [fromPos: string]: {
    [toPos:string]: (before:string) => string|string[]|null;
  },
}

export type MorphologyRelation = {
  form: string;
  base: string;
  baseForm: string;
}

export function isMorphologyRelation(x:any):x is MorphologyRelation {
  return typeof x === 'object' &&
    typeof x.form === 'string' &&
    typeof x.base === 'string' &&
    typeof x.baseForm === 'string';
}

export * from "./conjugate";
export * from './plural';
