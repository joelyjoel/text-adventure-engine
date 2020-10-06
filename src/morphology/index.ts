export interface Morphology {
  [fromPos: string]: {
    [toPos:string]: (before:string) => string|string[]|null;
  },
}

export * from "./conjugate";
export * from './plural';
