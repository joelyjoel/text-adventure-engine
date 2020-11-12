export function toCamelCase(...strings:string[]) {
  return strings.map(str => {
    return str.split(/\s|_/).map(word => word[0].toUpperCase() + word.slice(1)).join('')
  }).join('')
}

export function splitCamelCase(str:string):string[] {
  const reg = /[A-Z][a-z]*/g;
  let word
  const list = [];
  while((word = reg.exec(str)) !== null)
    list.push(word[0].toLowerCase());

  return list;
}

export function toSnakeCase(...strings:string[]) {
  return strings.map(str => str.replace(/\s+/g, '_')).join('_')
}

export function splitSnakeCase(str:string):string[] {
  return str.split('_');
}
