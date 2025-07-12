import { PLATFORM_ALIGN, POINTER_WIDTH } from "../consts";
import type { TypeTable } from "../type_table";
import { PointerValue } from "../valueclasses/PointerValue";
import type { Value } from "../valueclasses/Value";
import type { DefinedType } from "./DefinedType";
import { FlexArray } from "./FlexArray";
import { StaticArray } from "./StaticArray";

export class Pointer implements DefinedType {
    readonly #typeTable: TypeTable;
    readonly #itemType: DefinedType;

    constructor(
        typeTable: TypeTable,
        itemType: DefinedType,
        numElems?: number
    ) {
        this.#typeTable = typeTable;

        if (numElems !== undefined) {
            this.#itemType = new StaticArray(
                typeTable,
                itemType,
                numElems
            );
        } else {
            this.#itemType = itemType;
        }
    }

    get ItemType(): DefinedType {
        return this.#itemType;
    }

    get Size(): number {
        return this.__size;
    }

    get Align(): number {
        return this.__align;
    }

    Instantiate(addr: host.Int64, name?: string, parent?: Value): Value {
        return new PointerValue(addr, this, name, parent);
    }

    get __name(): string {
        if (this.#itemType instanceof StaticArray || this.#itemType instanceof FlexArray) {
            return `(${this.#itemType.__name})*`;
        }

        return `${this.#itemType.__name}*`;
    }

    get __size(): number {
        return POINTER_WIDTH;
    }

    get __align(): number {
        return PLATFORM_ALIGN;
    }

    get __itemType(): DefinedType {
        return this.#itemType;
    }

    toString(): string {
        return `${this.__name} (Size: ${this.__size}, Align: ${this.__align})`;
    }
}