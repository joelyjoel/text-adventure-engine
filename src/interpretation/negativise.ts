/** Negate a truth value */
export function negativise(truth:'T'|'F'|'?'):'F'|'T' {
  if(truth == 'T')
    return 'F';
  else if(truth == 'F')
    return 'T'
  else
    throw `Unexpected truth value: "${truth}"`
}
