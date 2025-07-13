import type { DefinedType } from "../typeclasses/DefinedType";
import type { Struct } from "../typeclasses/Struct";
import { checkAlign } from "./utils";
import type { Value } from "./Value";

class FieldValue {
    readonly Addr: host.Int64;
    readonly Type: DefinedType;
    readonly Name: string;
    readonly Parent: StructValue;
    readonly Value: Value;

    constructor(
        addr: host.Int64,
        type: DefinedType,
        name: string,
        parent: StructValue,
        value: Value
    ) {
        this.Addr = addr;
        this.Type = type;
        this.Name = name;
        this.Parent = parent;
        this.Value = value;
    }

    toString(): string {
        return this.Value.toString();
    }
}

export class StructValue implements Value {
    readonly Addr: host.Int64;
    readonly Type: Struct;
    readonly Name: string;
    readonly Parent?: Value;

    readonly #fields: FieldValue[] = [];

    [fieldName: string]: unknown;

    constructor(
        addr: host.Int64,
        type: Struct,
        name?: string,
        parent?: Value
    ) {
        this.Addr = addr;
        this.Type = type;
        this.Name = name || "(Anonymous)";
        this.Parent = parent;

        checkAlign(addr, type.__align);
    }

    get __fields(): readonly FieldValue[] {
        this.__eval();

        return this.#fields;
    }

    toString(): string {
        return this.Name;
    }

    __eval(): void {
        for (const fieldName in this.#fields) {
            delete this[fieldName];
        }

        this.#fields.length = 0;

        let offset = 0;

        for (const field of this.Type.__fields) {
            const shift = offset % field.Type.Align;

            if (shift !== 0) {
                offset += (field.Type.Align - shift);
            }

            const fieldAddr = this.Addr.add(offset);
            const value = new FieldValue(
                fieldAddr,
                field.Type.Type,
                field.Name,
                this,
                field.Type.Type.Instantiate(
                    fieldAddr,
                    `${this.Name}.${field.Name}`,
                    this
                )
            );

            this.#fields.push(value);
            this[field.Name] = value.Value;
            evalIfStruct(value.Value);

            offset += field.Type.Size;
        }
    }
}

// This is necessary because WinDbg enumerates the own properties of an object
// before evaluating them, so if we evaluate the struct when one of its properties
// is accessed, WinDbg won't show the field names that we add to the struct value.
export function evalIfStruct(value: Value): void {
    if (value instanceof StructValue) {
        value.__eval();
    }
}