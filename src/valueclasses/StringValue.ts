import { POINTER_WIDTH } from "../consts";
import type { DefinedType } from "../typeclasses/DefinedType";
import type { FlexArray } from "../typeclasses/FlexArray";
import type { Pointer } from "../typeclasses/Pointer";
import { Primitive } from "../typeclasses/Primitive";
import type { StaticArray } from "../typeclasses/StaticArray";
import { checkAlign } from "./utils";
import type { Value } from "./Value";

// An array of chars with a known size. May or may not be null-terminated.
export class StaticStringValue implements Value {
    readonly Addr: host.Int64;
    readonly Type: StaticArray;
    readonly Name?: string;
    readonly Parent?: Value;

    readonly #charType: Primitive;
    #value?: string;

    constructor(
        addr: host.Int64,
        type: StaticArray,
        name?: string,
        parent?: Value
    ) {
        this.Addr = addr;
        this.Type = type;
        this.Name = name;
        this.Parent = parent;

        checkAlign(addr, type.Align);
        checkChar(type.ElemType);

        this.#charType = type.ElemType;
    }

    get Value(): string {
        return this.__eval();
    }

    toString(): string {
        return this.__eval();
    }

    __eval(): string {
        const mem = host.memory.readMemoryValues(
            this.Addr,
            this.Type.NumElems,
            this.#charType.Size as 1 | 2,
            // What does a "signed char" even mean in this context?
            this.#charType.IsSigned
        );

        this.#value = "";

        for (const char of mem) {
            if (char === 0) {
                break;
            }

            this.#value += String.fromCharCode(char);
        }

        return this.#value;
    }
}

// A flex array of chars with a computable size. May or may not be null-terminated.
export class FlexStringValue implements Value {
    readonly Addr: host.Int64;
    readonly Type: FlexArray;
    readonly Name?: string;
    readonly Parent?: Value;

    readonly #charType: Primitive;
    #value?: string;

    constructor(
        addr: host.Int64,
        type: FlexArray,
        name?: string,
        parent?: Value
    ) {
        this.Addr = addr;
        this.Type = type;
        this.Name = name;
        this.Parent = parent;

        checkAlign(addr, type.Align);
        checkChar(type.ElemType);

        this.#charType = type.ElemType;
    }

    get Value(): string {
        return this.__eval();
    }

    get Size(): `${number}` {
        const size = this.Type.__sizeFn(this);

        return `${size}`;
    }

    get __size(): number {
        return this.Type.__sizeFn(this);
    }

    toString(): string {
        return this.__eval();
    }

    __eval(): string {
        const mem = host.memory.readMemoryValues(
            this.Addr,
            this.Type.__sizeFn(this),
            this.#charType.Size as 1 | 2,
            // What does a "signed char" even mean in this context?
            this.#charType.IsSigned
        );

        this.#value = "";

        for (const char of mem) {
            if (char === 0) {
                break;
            }

            this.#value += String.fromCharCode(char);
        }

        return this.#value;
    }
}

// A pointer to a null-terminated string
export class PointerStringValue implements Value {
    readonly Addr: host.Int64;
    readonly Type: Pointer;
    readonly Name?: string;
    readonly Parent?: Value;

    readonly #charSize: 1 | 2;
    #value?: string | null;

    constructor(
        addr: host.Int64,
        type: Pointer,
        name?: string,
        parent?: Value
    ) {
        this.Addr = addr;
        this.Type = type;
        this.Name = name;
        this.Parent = parent;

        checkAlign(addr, type.Align);
        checkChar(type.ItemType);

        this.#charSize = type.ItemType.Size;
    }

    get Pointee(): string | null {
        return this.__eval();
    }

    toString(): string {
        const value = this.__eval();

        if (value === null) {
            return "NULL";
        }

        return value;
    }

    __eval(): string | null {
        const ptrVal = host.memory.readMemoryValues(
            this.Addr,
            1,
            POINTER_WIDTH,
            false
        );

        const strAddr = ptrVal[0];

        if (strAddr.asNumber() === 0) {
            this.#value = null;
            return this.#value;
        }

        if (this.#charSize === 1) {
            this.#value = host.memory.readString(strAddr);
        } else {
            this.#value = host.memory.readWideString(strAddr);
        }

        return this.#value;
    }
}

// TODO: Make these assertions when the type is defined
function checkChar(type: DefinedType): asserts type is Primitive & { readonly Size: 1 | 2 } {
    if (!(type instanceof Primitive) || !type.IsChar) {
        throw new Error("Fixed string value must be an array of char primitives");
    }

    if (type.Size < 1 || type.Size > 2) {
        throw new Error("Char must be 1 or 2 bytes");
    }
}