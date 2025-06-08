import type { builtins, signed, float, primitive, struct, array, ptr, TypeDefns } from "./type_defn";

export class EvalContext {
    readonly #signed: typeof signed;
    readonly #float: typeof float;
    readonly #primitive: typeof primitive;
    readonly #struct: typeof struct;
    readonly #array: typeof array;
    readonly #ptr: typeof ptr;
    readonly #builtins: typeof builtins;
    #typeDefnsOut: TypeDefns | null = null;

    constructor(
        _signed: typeof signed,
        _float: typeof float,
        _primitive: typeof primitive,
        _struct: typeof struct,
        _array: typeof array,
        _ptr: typeof ptr,
        _builtins: typeof builtins
    ) {
        this.#signed = _signed;
        this.#float = _float;
        this.#primitive = _primitive;
        this.#struct = _struct;
        this.#array = _array;
        this.#ptr = _ptr;
        this.#builtins = _builtins;
    }

    // TODO: Verify types
    ReturnTypeDefns(defns: TypeDefns): void {
        this.#typeDefnsOut = defns;
    }

    __eval(jsSource: string): TypeDefns | null {
        // These are passed from outside and not imported directly to prevent
        // scripts from reassigning the imported references
        const signed = this.#signed;
        const float = this.#float;
        const primitive = this.#primitive;
        const struct = this.#struct;
        const array = this.#array;
        const ptr = this.#ptr;
        const builtins = this.#builtins;
        const ReturnTypeDefns = this.ReturnTypeDefns.bind(this);

        (() => {
            eval(jsSource);
        }).call(null);

        return this.#typeDefnsOut;
    }
}