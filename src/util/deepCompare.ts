export function deepCompare(a:any, b:any):boolean {
  if(a instanceof Object && b instanceof Object) {
    // Check they have the same keys
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if(!aKeys.every(key => bKeys.includes(key)))
      return false;
    if(!bKeys.every(key => aKeys.includes(key)))
      return false;

    // Check values match
    for(let key in a)
      if(!deepCompare(a[key], b[key]))
        return false;

    // Otherwise,
    return true;
  } else
    return a === b;
}

export function deepMatch(a:any, b:any):boolean {
  if(a instanceof Object && b instanceof Object) {
    for(let key in a)
      if(!deepMatch(a[key], b[key]))
        return false;
    
      // Otherwise,
       return true
  } else
    return a === b;
}
