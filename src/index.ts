/**
 * Denotes an object that can be used to generate a function that masquerades
 * as the original object. To make an object `Invokable`, implement a method
 * whose computed name is `[Invokable.call]`.
 */
export interface Invokable {
  [Invokable.call]: Function;
}

export namespace Invokable {
  /**
   * A tag that denotes callability.
   *
   * This is not yet a `unique symbol` because a compiler bug prevents this
   * from working with an index type:
   * https://github.com/Microsoft/TypeScript/issues/21912
   */
  export const call = '__call__';

  /**
   * Takes a `target` object that conforms to the `Invokable` interface and
   * returns a new object that is a function that masquerades as the original
   * `target` object. All properties, values, getters, setters, or otherwise
   * are replicated, including the prototype.
   *
   * Normal function objects have a read-only property called `name`. However,
   * if the `target` object defines its own value or getter called `name`, then
   * the `name` property will be made writable in the result. In all cases, the
   * `name` property will default to the original function or surrounding class
   * name.
   *
   * @throws {TypeError} if object does not implement `[Invokable.call]`
   */
  export function create<T extends Invokable>(
    target: T,
  ): T & T[typeof Invokable.call] {
    if (!(call in target)) {
      throw new TypeError('Object does not implement [Invokable.call]');
    }

    /**
     * "Copy" the `target` object by creating a forwarding function.
     *
     * - `f[call]` always re-resolves the `[Invokable.call]` method from the
     *   copy. The method can be replaced at runtime and the created invokable
     *   will not be "stuck" with the old one.
     * - `apply(f, arguments)` ensures that the `this` context is bound to the
     *   copy, not the original `target`.
     */
    const f = (function() {
      return f[call].apply(f, arguments);
    } as any) as T & T[typeof Invokable.call];

    if (Object.getPrototypeOf(target) === Object.prototype) {
      // A plain object was passed.

      const hasName = 'name' in target;
      Object.defineProperty(f, 'name', {
        configurable: true,
        enumerable: hasName,
        writable: hasName,
        // Default to the `[Invokable.call]` function name, if it had any.
        value: target[call].name,
      });

      /**
       * Replicate all own properties, including getters and setters, without
       * invoking those getters and setters.
       */
      Object.defineProperties(f, Object.getOwnPropertyDescriptors(target));

      return f;
    } else {
      // An instantiated object was passed.
      const {constructor} = target;

      const hasOwnName: boolean = Object.prototype.hasOwnProperty.call(
        target,
        'name',
      );
      Object.defineProperty(f, 'name', {
        configurable: true,
        enumerable: hasOwnName,
        writable: hasOwnName,
        // Default to the surrounding class's name.
        value: constructor.name,
      });

      /**
       * Replicate all own properties, including getters and setters, without
       * invoking those getters and setters.
       */
      Object.defineProperties(f, Object.getOwnPropertyDescriptors(target));

      /**
       * Mirror the prototype of the original object, allowing properties
       * defined on the prototype to resolve properly. Furthermore, lower-level
       * operations like the `instanceof` operator and accessing the
       * `constructor` property continue to work as expected.
       */
      Object.setPrototypeOf(f, constructor.prototype);

      return f;
    }
  }
}
