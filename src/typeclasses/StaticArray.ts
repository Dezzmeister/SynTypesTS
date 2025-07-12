import type { TypeTable } from "../type_table";
import { StaticArrayValue } from "../valueclasses/StaticArrayValue";
import { Value } from "../valueclasses/Value";
import type { DefinedType } from "./DefinedType";

export class StaticArray implements DefinedType {
    readonly #typeTable: TypeTable;
    readonly #elemType: DefinedType;
    readonly #numElems: number;
    readonly #size: number;
    readonly #align: number;

    constructor(
        typeTable: TypeTable,
        elemType: DefinedType,
        numElems: number
    ) {
        this.#typeTable = typeTable;
        this.#elemType = elemType;
        this.#numElems = numElems;

        const elemSize = typeTable.__sizeof(this.#elemType);

        this.#size = elemSize * this.#numElems;
        this.#align = typeTable.__alignof(this.#elemType);
    }

    get ElemType(): DefinedType {
        return this.#elemType;
    }

    get NumElems(): number {
        return this.#numElems;
    }

    get Size(): number {
        return this.#size;
    }

    get Align(): number {
        return this.#align;
    }

    Instantiate(addr: host.Int64, name?: string, parent?: Value): Value {
        return new StaticArrayValue(addr, this, name, parent);
    }

    get __name(): string {
        return `${this.#elemType.__name}[${this.#numElems}]`;
    }

    get __size(): number {
        return this.#size;
    }

    get __align(): number {
        return this.#align;
    }

    get __elemType(): DefinedType {
        return this.#elemType;
    }

    toString(): string {
        return `${this.__name} (Size: ${this.#size}, Align: ${this.#align})`;
    }
}