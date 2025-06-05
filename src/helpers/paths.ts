export const firstOrderPaths = <T>(
  paths: T[],
  getter: (v: T) => string = (a) => a as any
): string[] => paths.map((e) => getter(e)).filter((v) => !v.includes('.'))

export const subpathsObject = <T>(
  paths: T[],
  field: string,
  getter: (o: T) => string,
  setter: (o: T, newPath: string) => T
): T[] =>
  paths
    .filter((path) => getter(path).startsWith(field + '.'))
    .map((path) => setter(path, getter(path).replace(field + '.', '')))
