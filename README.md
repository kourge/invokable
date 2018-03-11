# invokable

A way to make invokable JavaScript objects. Reminiscent of Python's [`__call__`](https://docs.python.org/3/reference/datamodel.html#object.__call__).

* [Installation](#installation)
* [Usage](#usage)
* [Capabilities and Limitations](#capabilities-and-limitations)
* [API](#api)
* [TypeScript Support](#typescript-support)
* [Benchmarks](#benchmarks)
* [Performance](#performance)
* [Inspiration](#inspiration)

## Installation

```bash
npm install invokable
```

## Usage

Using with a class:

```js
import {Invokable} from 'invokable';

class Rect {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    return Invokable.create(this);
  }

  get area() {
    return this.width * this.height;
  }

  [Invokable.call](depth = 1) {
    return this.area * depth;
  }
}
```

* Implement a method with the computed name `[Invokable.call]` with any
  signature of your choice.
* End the constructor with `return Invokable.create(this)`

Also works with a plain object:

```js
import {Invokable} from 'invokable';

const Rect = (width, height) =>
  Invokable.create({
    width,
    height,
    get area() {
      return this.width * this.height;
    },
    [Invokable.call](depth = 1) {
      return this.area * depth;
    },
  });
```

* Declare a property with the computed name `[Invokable.call]` with any
  function of your choice.
* Pass the entire object to `Invokable.create`

## Capabilities and Limitations

`Invokable.create` can:

* Preserve the `this` context of the object.
* Do the right thing when an object's `[Invokable.call]` method has been
  replaced at runtime.
* Replicate all properties without triggering getters and setters.
* Inherit the same prototype, ensuring things like `constructor` and the
  `instanceof` operator still work.
* Create functions whose `name` property is writable. Simply define a `name`
  property in the original target object.

It cannot:

* Modify the original object. A new object that masquerades as the original is
  returned.
* Do anything with an object that does not implement `[Invokable.call]`. A
  `TypeError` is thrown when such an object is given.
* Work on JavaScript engines that don't support `Object.setPrototype`,
  `Object.getOwnPropertyDescriptors`, and `Object.defineProperties`, unless
  they have been polyfilled.
* Be rebound using `.bind(...)`. However, the `[Invokable.call]` method can
  still be rebound.

## API

* `Invokable.create(target)` takes a `target` object that conforms to the
  `Invokable` interface and returns a new object that is a function that
  masquerades as the original `target` object. All properties, values, getters,
  setters, or otherwise are replicated, including the prototype.

  Normal function objects have a read-only property called `name`. However, if
  the `target` object defines its own value or getter called `name`, then the
  `name` property will be made writable in the result. In all cases, the `name`
  property will default to the original function or surrounding class name.

  If the `target` object does not implement `[Invokable.call]`, a `TypeError`
  is thrown.

* `Invokable.call` is a tag that denotes callability. It is a constant used by
  an object to conform to the `Invokable` interface. Its current value is the
  string `__call__`, but it may become a symbol in the future.

## TypeScript Support

TypeScript support comes out of the box without any additional setup. Here is
the TypeScript version of the class example:

```ts
import {Invokable} from 'invokable';

class Rect {
  constructor(public width: number, public height: number) {
    return Invokable.create(this);
  }

  get area() {
    return this.width * this.height;
  }

  [Invokable.call](depth = 1) {
    return this.area * depth;
  }
}

interface Rect {
  (depth?: number): number;
}
```

Note that it is necessary to modify the interface generated by the class in
order make class instances callable to the type system.

The TypeScript version of the plain object example:

```ts
import {Invokable} from 'invokable';

const Rect = (width: number, height: number) =>
  Invokable.create({
    width,
    height,
    get area() {
      return this.width * this.height;
    },
    [Invokable.call](depth = 1) {
      return this.area * depth;
    },
  });
```

## Benchmarks

Results were measured on an Intel Core M @ 1.2GHz with 8GB of DDR3-1600 on
Node.JS v8.3.0. Throughput numbers are expressed in operations per second (ops).

### Class instantiation, no args

| Test description | Throughput |  Error | Percent of best |
| ---------------- | ---------: | -----: | --------------: |
| plain            |  107464004 | ±1.71% |         100.00% |
| invokable        |     147857 | ±3.32% |           0.14% |

### Class instantiation, 5 args

| Test description | Throughput |  Error | Percent of best |
| ---------------- | ---------: | -----: | --------------: |
| plain            |   12722162 | ±1.78% |         100.00% |
| invokable        |     144240 | ±3.45% |           1.13% |

### Class instantiation, 10 args

| Test description | Throughput |  Error | Percent of best |
| ---------------- | ---------: | -----: | --------------: |
| plain            |    9185841 | ±1.48% |         100.00% |
| invokable        |     144790 | ±3.58% |           1.58% |

### Class instance: own property access

| Test description | Throughput |  Error | Percent of best |
| ---------------- | ---------: | -----: | --------------: |
| plain            |  450120750 | ±1.48% |         100.00% |
| invokable        |  448748906 | ±1.51% |          99.70% |

### Class instance: method call on prototype

| Test description | Throughput |  Error | Percent of best |
| ---------------- | ---------: | -----: | --------------: |
| plain            |  443185849 | ±1.68% |          98.26% |
| invokable        |  451041317 | ±1.64% |         100.00% |

### Class instance: getter on prototype

| Test description | Throughput |  Error | Percent of best |
| ---------------- | ---------: | -----: | --------------: |
| plain            |  448271681 | ±2.17% |         100.28% |
| invokable        |  447015599 | ±1.31% |         100.00% |

### Class instance: setter on prototype

| Test description | Throughput |  Error | Percent of best |
| ---------------- | ---------: | -----: | --------------: |
| plain            |  356063076 | ±3.93% |          96.11% |
| invokable        |  370482861 | ±1.55% |         100.00% |

### Object creation, no args

| Test description | Throughput |  Error | Percent of best |
| ---------------- | ---------: | -----: | --------------: |
| plain            |     495464 | ±5.21% |         100.00% |
| invokable        |      73149 | ±3.58% |          14.76% |

### Object creation, 5 args

| Test description | Throughput |  Error | Percent of best |
| ---------------- | ---------: | -----: | --------------: |
| plain            |     455371 | ±8.85% |         100.00% |
| invokable        |      71283 | ±3.99% |          15.65% |

### Object creation, 10 args

| Test description | Throughput |  Error | Percent of best |
| ---------------- | ---------: | -----: | --------------: |
| plain            |     470126 | ±6.42% |         100.00% |
| invokable        |      70540 | ±4.37% |          15.00% |

### Object: own property access

| Test description | Throughput |  Error | Percent of best |
| ---------------- | ---------: | -----: | --------------: |
| plain            |  416151276 | ±0.96% |          99.76% |
| invokable        |  417164274 | ±0.87% |         100.00% |

### Object: own property call

| Test description | Throughput |  Error | Percent of best |
| ---------------- | ---------: | -----: | --------------: |
| plain            |   83609556 | ±2.94% |         100.00% |
| invokable        |   54168693 | ±1.27% |          64.79% |

### Object: own property getter

| Test description | Throughput |  Error | Percent of best |
| ---------------- | ---------: | -----: | --------------: |
| plain            |   51863522 | ±1.21% |         100.00% |
| invokable        |   51401432 | ±5.03% |          99.11% |

### Object: own property setter

| Test description | Throughput |   Error | Percent of best |
| ---------------- | ---------: | ------: | --------------: |
| plain            |  267193097 |  ±0.85% |         100.00% |
| invokable        |  197801204 | ±18.43% |          74.03% |

### Invocation, no args

| Test description             | Throughput |  Error | Percent of best |
| ---------------------------- | ---------: | -----: | --------------: |
| `instance.__call__()`        |   17807793 | ±1.19% |          95.57% |
| `instance[Invokable.call]()` |   17446234 | ±1.55% |          93.63% |
| `instance()`                 |   18633571 | ±1.51% |         100.00% |

### Invocation, 5 args

| Test description             | Throughput |  Error | Percent of best |
| ---------------------------- | ---------: | -----: | --------------: |
| `instance.__call__()`        |    8164700 | ±3.61% |          97.58% |
| `instance[Invokable.call]()` |    8367181 | ±1.47% |         100.00% |
| `instance()`                 |    7318022 | ±5.51% |          87.46% |

### Invocation, 10 args

| Test description             | Throughput |  Error | Percent of best |
| ---------------------------- | ---------: | -----: | --------------: |
| `instance.__call__()`        |    6898069 | ±2.00% |          94.93% |
| `instance[Invokable.call]()` |    7040076 | ±3.05% |          96.88% |
| `instance()`                 |    7266453 | ±2.24% |         100.00% |

## Performance

* Creating an invokable object is very slow. Doing so for a plain object incurs
  around a 7x slowdown, whereas doing so for a class instance can suffer from
  around a 700x slowdown. Therefore, avoid performing a huge number of calls to
  `Invokable.create` in a hot code path.
* Property access, regardless of whether or not through the prototype, is not
  significantly impacted.
* Invoking the invokable object itself is also not guaranteed to be faster than
  directly invoking the method it points to.

## Inspiration

`invokable` is inspired by the
[`callable-object`](https://github.com/za-creature/callable-object) project.
