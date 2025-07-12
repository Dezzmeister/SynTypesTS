import type { StaticArray } from "../typeclasses/StaticArray";
import type { Value } from "./Value";
import { checkAlign } from "./utils";

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

        for (let i = 0; i < type.NumElems; i++) {
            const elem = type.ElemType.Instantiate(
                addr.add(i * type.ElemType.__size),
                `${name}[${i}]`,
                this
            );
            this.#elements.push(elem);
        }
    }

    *[Symbol.iterator](): Generator<Value> {
        let i = 0;

        while (i < this.#elements.length) {
            yield this.#elements[i];
            i++;
        }

        return;
    }

    toString(): string {
        const name = this.Name || `(${this.Type.__name})`;

        return `${name}[${this.#elements.length}]`;
    }
}