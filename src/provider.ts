/** Definitely not the cleanest way to do it but
 * providers and dependency injection kick in too late
 * for `@VineModel()`
 */
export const VineModelSchemasInstallers: (() => void)[] = []

export default class VineModelProvider {
  async register() {
    VineModelSchemasInstallers.forEach((i) => i())
  }
}
