export function findInEnumByValue<Type>(
  enumDef: { [key: string]: string },
  value: string | undefined,
) {
  if (!value) return undefined;

  if (Object.values(enumDef).includes(value.toLowerCase()))
    return value.toLowerCase() as Type;
}

export function humanize(str: string) {
  if (str === null || str == undefined) return str;
  return str
    .replace(/^[\s_]+|[\s_]+$/g, '')
    .replace(/[_\s]+/g, ' ')
    .replace(/^[a-z]/, (m) => {
      return m.toUpperCase();
    });
}
