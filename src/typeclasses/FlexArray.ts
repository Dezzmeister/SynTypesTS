import type { FlexSizeFn } from "../type_defn";
import type { TypeTable } from "../type_table";
import { FlexArrayValue } from "../valueclasses/FlexArrayValue";
import { Value } from "../valueclasses/Value";
import type { DefinedType } from "./DefinedType";

export class FlexArray implements DefinedType {
    readonly #typeTable: TypeTable;
    readonly #elemType: DefinedType;
    readonly #sizeFn: FlexSizeFn;
    readonly #align: number;

    constructor(
        typeTable: TypeTable,
        elemType: DefinedType,
        sizeFn: FlexSizeFn,
    ) {
        this.#typeTable = typeTable;
        this.#elemType = elemType;
        this.#sizeFn = sizeFn;
        this.#align = typeTable.__alignof(elemType);
    }

    get ElemType(): DefinedType {
        return this.#elemType;
    }

    get Size(): string {
        return "Unknown";
    }

    get Align(): number {
        return this.#align;
    }

    Instantiate(addr: host.Int64, name?: string, parent?: Value): Value {
        return new FlexArrayValue(addr, this, name, parent);
    }

    get __name(): string {
        return `${this.#elemType.__name}[(func)]`;
    }

    get __size(): number {
        return 0;
    }

    get __align(): number {
        return this.#align;
    }

    get __sizeFn(): FlexSizeFn {
        return this.#sizeFn;
    }

    get __elemType(): DefinedType {
        return this.#elemType;
    }

    toString(): string {
        return `${this.__name} (Size: ${this.Size}, Align: ${this.#align})`;
    }
}