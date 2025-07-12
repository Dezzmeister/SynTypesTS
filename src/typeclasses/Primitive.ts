import { signed, float, bool, char } from "../type_defn";
import type { DefinedType } from "./DefinedType";
import { createPrimitiveValue } from "../valueclasses/PrimitiveValue";
import { Value } from "../valueclasses/Value";

export class Primitive implements DefinedType {
    readonly #name: string;
    readonly #size: number;
    readonly #align: number;
    readonly #flags: number;

    constructor(
        name: string,
        size: number,
        align: number,
        flags: number
    ) {
        this.#name = name;
        this.#size = size;
        this.#align = align;
        this.#flags = flags;
    }

    get Name(): string {
        return this.#name;
    }

    get Size(): number {
        return this.#size;
    }

    get Align(): number {
        return this.#align;
    }

    get IsSigned(): boolean {
        return !!(this.#flags & signed);
    }

    get IsFloat(): boolean {
        return !!(this.#flags & float);
    }

    get IsBool(): boolean {
        return !!(this.#flags & bool);
    }

    get IsChar(): boolean {
        return !!(this.#flags & char);
    }

    Instantiate(addr: host.Int64, name?: string, parent?: Value): Value {
        return createPrimitiveValue(addr, this, name, parent);
    }

    get __name(): string {
        return this.Name;
    }

    get __size(): number {
        return this.Size;
    }

    get __align(): number {
        return this.Align;
    }

    toString(): string {
        return `${this.Name} (Size: ${this.Size}, Align: ${this.Align})`;
    }
}