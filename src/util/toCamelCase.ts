export function toCamelCase(...strings:string[]) {
  return strings.map(str => {
    return str.split(/\s/).map(word => word[0].toUpperCase() + word.slice(1)).join('')
  }).join('')
}