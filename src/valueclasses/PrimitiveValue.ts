import type { Value } from "./Value";
import type { Primitive } from "../typeclasses/Primitive";
import { LITTLE_ENDIAN } from "../consts";
import { checkAlign } from "./utils";

export function createPrimitiveValue(
    addr: host.Int64,
    primitive: Primitive,
    name?: string,
    parent?: Value
): Value {
    if (primitive.__size === 0) {
        return new VoidValue(addr, primitive, parent);
    }

    if (primitive.IsFloat) {
        return new FloatValue(addr, primitive, name, parent);
    }

    if (primitive.IsBool) {
        return new BoolValue(addr, primitive, name, parent);
    }

    if (primitive.IsChar) {
        return new CharValue(addr, primitive, name, parent);
    }

    return new IntValue(addr, primitive, name, parent);
}

export class IntValue implements Value {
    readonly Addr: host.Int64;
    readonly Type: Primitive;
    readonly Name?: string;
    readonly Parent?: Value;

    #value?: host.Int64;

    constructor(
        addr: host.Int64,
        type: Primitive,
        name?: string,
        parent?: Value
    ) {
        this.Addr = addr;
        this.Type = type;
        this.Name = name;
        this.Parent = parent;

        checkAlign(addr, type.__align);
    }

    get Value(): host.Int64 {
        return this.__eval();
    }

    toString(): string {
        const value = this.__eval();

        return `${value.asNumber()}`;
    }

    __eval(): host.Int64 {
        this.#value = readInt(this.Addr, this.Type);

        return this.#value;
    }
}

export class FloatValue implements Value {
    readonly Addr: host.Int64;
    readonly Type: Primitive;
    readonly Name?: string;
    readonly Parent?: Value;

    #value?: number;

    constructor(
        addr: host.Int64,
        type: Primitive,
        name?: string,
        parent?: Value
    ) {
        this.Addr = addr;
        this.Type = type;
        this.Name = name;
        this.Parent = parent;

        checkSize(type.__size);
        checkAlign(addr, type.__align);

        if (type.__size !== 4 && type.__size !== 8) {
            throw new Error("Primitive float must have size 4 or 8");
        }

    }

    get Value(): number {
        return this.__eval();
    }

    toString(): string {
        return `${this.__eval()}`;
    }

    __eval(): number {
        const mem = host.memory.readMemoryValues(
            this.Addr,
            this.Type.__size,
            1,
            false
        );

        const view = new DataView(mem.buffer, mem.byteOffset, mem.byteLength);

        if (this.Type.__size == 4) {
            this.#value = view.getFloat32(0, LITTLE_ENDIAN);
        } else if (this.Type.__size == 8) {
            this.#value = view.getFloat32(0, LITTLE_ENDIAN);
        } else {
            throw new Error("Primitive float must have size 4 or 8");
        }

        return this.#value;
    }
}

export class BoolValue implements Value {
    readonly Addr: host.Int64;
    readonly Type: Primitive;
    readonly Name?: string;
    readonly Parent?: Value;

    #value?: boolean;

    constructor(
        addr: host.Int64,
        type: Primitive,
        name?: string,
        parent?: Value
    ) {
        this.Addr = addr;
        this.Type = type;
        this.Name = name;
        this.Parent = parent;

        checkAlign(addr, type.__align);
    }

    get Value(): boolean {
        return this.__eval();
    }

    toString(): string {
        return `${this.__eval()}`;
    }

    __eval(): boolean {
        this.#value = !!readInt(this.Addr, this.Type);

        return this.#value;
    }
}

export class CharValue implements Value {
    readonly Addr: host.Int64;
    readonly Type: Primitive;
    readonly Name?: string;
    readonly Parent?: Value;

    #value?: string;

    constructor(
        addr: host.Int64,
        type: Primitive,
        name?: string,
        parent?: Value
    ) {
        this.Addr = addr;
        this.Type = type;
        this.Name = name;
        this.Parent = parent;

        checkAlign(addr, type.__align);

        const charAsInt = readInt(addr, type);
        this.#value = String.fromCharCode(charAsInt.asNumber());
    }

    get Value(): string {
        return this.__eval();
    }

    toString(): string {
        return this.__eval();
    }

    __eval(): string {
        const charAsInt = readInt(this.Addr, this.Type);
        this.#value = String.fromCharCode(charAsInt.asNumber());

        return this.#value;
    }
}

export class VoidValue implements Value {
    readonly Addr: host.Int64;
    readonly Type: Primitive;
    readonly Parent?: Value;

    constructor(
        addr: host.Int64,
        type: Primitive,
        parent?: Value
    ) {
        this.Addr = addr;
        this.Type = type;
        this.Parent = parent;
    }

    __eval(): void {}
}

function checkSize(size: number): asserts size is 1 | 2 | 4 | 8 {
    if (
        size !== 1 &&
        size !== 2 &&
        size !== 4 &&
        size !== 8
    ) {
        throw new Error(
            `Primitive size must be 1, 2, 4, or 8. Size of ${size} is invalid`
        );
    }
}

function readInt(addr: host.Int64, type: Primitive): host.Int64 {
    checkSize(type.__size);

    const mem = host.memory.readMemoryValues(
        addr,
        1,
        type.__size,
        type.IsSigned
    );

    let value: host.Int64;

    if (type.__size === 8) {
        value = (mem as host.Int64[])[0];
    } else {
        const element = mem[0];

        if (typeof element === "number") {
            value = new host.Int64(element);
        } else {
            value = element;
        }
    }

    if (value == undefined) {
        throw new Error(`Failed to read primitive at ${addr}`);
    }

    return value;
}