// Symbol polyfill
if (typeof Symbol === "undefined") {
  console.log("xxxxxxx", typeof Symbol);

  (global as any).Symbol = (function () {
    let symbolCounter = 0;

    function Symbol(description) {
      const symbol = {
        toString() {
          return `Symbol(${description || ""})`;
        },
        valueOf() {
          return this;
        },
        [Symbol.toPrimitive]() {
          return this;
        },
      };

      // 创建唯一标识
      Object.defineProperty(symbol, "description", {
        value: description,
        writable: false,
        enumerable: false,
        configurable: false,
      });

      Object.defineProperty(symbol, "__symbolId__", {
        value: `__symbol_${symbolCounter++}__`,
        writable: false,
        enumerable: false,
        configurable: false,
      });

      return symbol;
    }

    // Symbol.for 实现
    const globalSymbolRegistry = {};
    Symbol.for = function (key) {
      if (globalSymbolRegistry[key]) {
        return globalSymbolRegistry[key];
      }
      const symbol = Symbol(key);
      globalSymbolRegistry[key] = symbol;
      return symbol;
    };

    // Symbol.keyFor 实现
    Symbol.keyFor = function (symbol) {
      for (let key in globalSymbolRegistry) {
        if (globalSymbolRegistry[key] === symbol) {
          return key;
        }
      }
      return undefined;
    };

    // 内置 Symbol
    Symbol.iterator = Symbol("Symbol.iterator");
    Symbol.toStringTag = Symbol("Symbol.toStringTag");
    Symbol.toPrimitive = Symbol("Symbol.toPrimitive");

    return Symbol;
  })();
}
