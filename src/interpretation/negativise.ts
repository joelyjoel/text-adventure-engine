/** Negate a truth value */
export function negativise(truth:string):string {
  if(truth == 'T')
    return 'F';
  else if(truth == 'F')
    return 'T'
  else
    throw `Unexpected truth value: "${truth}"`
}