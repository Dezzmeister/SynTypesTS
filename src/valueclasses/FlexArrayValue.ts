import type { FlexArray } from "../typeclasses/FlexArray";
import { Primitive } from "../typeclasses/Primitive";
import { FlexStringValue } from "./StringValue";
import { evalIfStruct } from "./StructValue";
import { checkAlign } from "./utils";
import type { Value } from "./Value";

export function createFlexArrayValue(
    addr: host.Int64,
    type: FlexArray,
    name?: string,
    parent?: Value
): FlexArrayValue | FlexStringValue {
    if (type.ElemType instanceof Primitive && type.ElemType.IsChar) {
        return new FlexStringValue(
            addr,
            type,
            name,
            parent
        );
    }

    return new FlexArrayValue(
        addr,
        type,
        name,
        parent
    );
}

export class FlexArrayValue implements Value {
    readonly Addr: host.Int64;
    readonly Type: FlexArray;
    readonly Name?: string;
    readonly Parent?: Value;

    readonly #elements: Value[] = [];

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

        checkAlign(addr, type.__align);
    }

    *[Symbol.iterator](): Generator<Value> {
        this.__eval();
        let i = 0;

        while (i < this.#elements.length) {
            yield this.#elements[i];
            i++;
        }

        return;
    }

    get Size(): `${number}` {
        const size = this.Type.__sizeFn(this);

        return `${size}`;
    }

    get __size(): number {
        return this.Type.__sizeFn(this);
    }

    toString(): string {
        this.__eval();

        const name = this.Name || `(${this.Type.__name})`;

        return `${name}[${this.#elements.length}]`;
    }

    __eval(): void {
        this.#elements.length = 0;

        const size = this.Type.__sizeFn(this);

        for (let i = 0; i < size; i++) {
            const elem = this.Type.ElemType.Instantiate(
                this.Addr.add(i * this.Type.ElemType.__size),
                `${this.Name}[${i}]`,
                this
            );
            evalIfStruct(elem);
            this.#elements.push(elem);
        }
    }
}