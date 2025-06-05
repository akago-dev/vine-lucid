/*
 * vine-lucid
 *
 * (c) AKAGO SAS <po@akago.fr>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

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
