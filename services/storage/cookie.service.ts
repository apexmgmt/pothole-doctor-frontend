import Cookies from 'js-cookie'

/**
 * CookieService provides static methods to manage browser cookies using js-cookie.
 */
export default class CookieService {
  /**
   * Stores a cookie with the given name, value, and options.
   * @param name The name of the cookie.
   * @param value The value to store.
   * @param options Optional js-cookie options (expires, path, etc.).
   */
  static store(name: string, value: string, options?: Cookies.CookieAttributes): void {
    Cookies.set(name, value, options)
  }

  /**
   * Retrieves the value of a cookie by name.
   * @param name The name of the cookie.
   * @returns The cookie value or undefined if not found.
   */
  static get(name: string): string | undefined {
    return Cookies.get(name)
  }

  /**
   * Updates an existing cookie by overwriting its value and options.
   * @param name The name of the cookie.
   * @param value The new value to store.
   * @param options Optional js-cookie options (expires, path, etc.).
   */
  static update(name: string, value: string, options?: Cookies.CookieAttributes): void {
    Cookies.set(name, value, options)
  }

  /**
   * Deletes a specific cookie by name.
   * @param name The name of the cookie to delete.
   * @param options Optional js-cookie options (path, domain, etc.).
   */
  static delete(name: string, options?: Cookies.CookieAttributes): void {
    Cookies.remove(name, options)
  }

  /**
   * Clears all cookies accessible from the current location.
   */
  static clear(): void {
    const allCookies = Cookies.get()
    Object.keys(allCookies).forEach(cookieName => {
      Cookies.remove(cookieName)
    })
  }
}
