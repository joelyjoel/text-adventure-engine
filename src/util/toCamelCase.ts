export function toCamelCase(...strings:string[]) {
  return strings.map(str => {
    return str.split(/\s/).map(word => word[0].toUpperCase() + word.slice(1)).join('')
  }).join('')
}

export function toSnakeCase(...strings:string[]) {
  return strings.map(str => str.replace(/\s+/g, '_')).join('_')
}