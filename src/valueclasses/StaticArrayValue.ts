import { Primitive } from "../typeclasses/Primitive";
import type { StaticArray } from "../typeclasses/StaticArray";
import { StaticStringValue } from "./StringValue";
import { evalIfStruct } from "./StructValue";
import type { Value } from "./Value";
import { checkAlign } from "./utils";

export function createStaticArrayValue(
    addr: host.Int64,
    type: StaticArray,
    name?: string,
    parent?: Value
): StaticArrayValue | StaticStringValue {
    if (type.ElemType instanceof Primitive && type.ElemType.IsChar) {
        return new StaticStringValue(
            addr,
            type,
            name,
            parent
        );
    }

    return new StaticArrayValue(
        addr,
        type,
        name,
        parent
    );
}

export class StaticArrayValue implements Value {
    readonly Addr: host.Int64;
    readonly Type: StaticArray;
    readonly Name?: string;
    readonly Parent?: Value;
    readonly #elements: Value[] = [];

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

    toString(): string {
        const name = this.Name || `(${this.Type.__name})`;

        return `${name}[${this.Type.NumElems}]`;
    }

    __eval(): void {
        this.#elements.length = 0;

        for (let i = 0; i < this.Type.NumElems; i++) {
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