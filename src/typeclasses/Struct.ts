import type { TypeTable } from "../type_table";
import { StructValue } from "../valueclasses/StructValue";
import type { Value } from "../valueclasses/Value";
import type { DefinedType } from "./DefinedType";

// TODO: Get rid of this?
export class FieldType {
    readonly #type: DefinedType;
    readonly #size: number;
    readonly #align: number;

    constructor(
        type: DefinedType,
        size: number,
        align: number
    ) {
        this.#type = type;
        this.#size = size;
        this.#align = align;
    }

    get Type(): DefinedType {
        return this.#type;
    }

    get Size(): number {
        return this.#size;
    }

    get Align(): number {
        return this.#align;
    }

    toString(): string {
        return `${this.#type.__name} (Size: ${this.#size}, Align: ${this.#align})`;
    }
}

export class NamedField {
    readonly #name: string;
    readonly #type: FieldType;

    constructor(
        name: string,
        type: FieldType
    ) {
        this.#name = name;
        this.#type = type;
    }

    get Name(): string {
        return this.#name;
    }

    get Type(): FieldType {
        return this.#type;
    }

    get __name(): string {
        return this.#name;
    }

    get __type(): DefinedType {
        return this.#type.Type;
    }

    toString(): string {
        return this.#name;
    }
}

export class Struct implements DefinedType {
    readonly #typeTable: TypeTable;
    readonly #name: string;
    readonly #fields: NamedField[] = [];
    readonly #size: number;
    readonly #align: number;

    // These are actually FieldTypes, but typing the index signature as such would
    // conflict with explicit properties with other types. I'm also relying on the
    // assumption that WinDbg accesses keys in the order that they're added to
    // the object. I don't know if this is true but I haven't seen otherwise yet.
    [fieldName: string]: unknown;

    constructor(name: string, typeTable: TypeTable, ...fields: NamedField[]) {
        this.#name = name;
        this.#typeTable = typeTable;
        this.#fields = fields;

        let size = 0;
        let align = 1;

        for (const field of fields) {
            if (field.Type.Align > align) {
                align = field.Type.Align;
            }

            const offset = size % align;
            const startAt = offset === 0 ? size : size + align - offset;

            size = startAt + field.Type.Size;
            this[field.Name] = field.Type;
        }

        this.#size = size;
        this.#align = align;
    }

    Instantiate(addr: host.Int64, name?: string, parent?: Value): StructValue {
        return new StructValue(addr, this, name, parent);
    }

    get __name(): string {
        return this.#name;
    }

    get __size(): number {
        return this.#size;
    }

    get __align(): number {
        return this.#align;
    }

    get __fields(): NamedField[] {
        return this.#fields;
    }

    toString(): string {
        return `struct ${this.#name} (Size: ${this.__size}, Align: ${this.__align})`;
    }
}