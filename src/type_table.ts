import { log } from "./logging";
import { StaticArrayDefn, StructDefn, type TypeDefn, float, signed, toString } from "./type_defn";
import { DefinedType } from "./typeclasses/DefinedType";
import { FlexArray } from "./typeclasses/FlexArray";
import { Pointer } from "./typeclasses/Pointer";
import { Primitive } from "./typeclasses/Primitive";
import { StaticArray } from "./typeclasses/StaticArray";
import { FieldType, NamedField, Struct } from "./typeclasses/Struct";
import { evalIfStruct } from "./valueclasses/StructValue";
import { Value } from "./valueclasses/Value";

export class TypeTable {
    readonly #name: string;
    readonly #primitives: Record<string, Primitive> = {};
    readonly #structs: Record<string, Struct> = {};
    readonly #staticArrays: Record<string, StaticArray> = {};
    readonly #values: Record<string, Value> = {};

    constructor(
        name: string
    ) {
        this.#name = name;

        const primitives = this.#primitives;
        const structs = this.#structs;
        const staticArrays = this.#staticArrays;
        const values = this.#values;

        Object.setPrototypeOf(this.#primitives, {
            toString(): string {
                return `Count: ${Object.keys(primitives).length}`;
            }
        });
        Object.setPrototypeOf(this.#structs, {
            toString(): string {
                return `Count: ${Object.keys(structs).length}`;
            }
        });
        Object.setPrototypeOf(this.#staticArrays, {
            toString(): string {
                return `Count: ${Object.keys(staticArrays).length}`;
            }
        });
        Object.setPrototypeOf(this.#values, {
            toString(): string {
                return `Count: ${Object.keys(values).length}`;
            }
        });
    }

    get Name(): string {
        return this.#name;
    }

    get Primitives(): Record<string, Primitive> {
        return this.#primitives;
    }

    get Structs(): Record<string, Struct> {
        return this.#structs;
    }

    get StaticArrays(): Record<string, StaticArray> {
        return this.#staticArrays;
    }

    get Values(): Record<string, Value> {
        for (const name in this.#values) {
            evalIfStruct(this.#values[name]);
        }

        return this.#values;
    }

    Instantiate(addr: host.Int64, typename: string, name: string): Value {
        const defn = this.__lookupTypename(typename);

        if (!defn) {
            throw new Error(`Type "${typename}" does not exist`);
        }

        const value = defn.Instantiate(addr, name);
        value.__eval();

        this.#values[name] = value;

        return value;
    }

    __addTypeDefn(defn: TypeDefn): void {
        if (typeof defn === "string") {
            const existing = this.__lookupTypename(defn);

            if (existing) {
                throw new TypeDefinedError(defn);
            }
        } else if (defn.kind === "primitive") {
            const existing = this.__lookupTypename(defn.name);

            if (existing) {
                throw new TypeDefinedError(defn);
            }

            this.#primitives[defn.name] = new Primitive(
                defn.name,
                defn.size,
                defn.align,
                defn.flags
            );
        } else if (defn.kind === "struct") {
            const existing = this.__lookupTypename(defn.name);

            if (existing) {
                throw new TypeDefinedError(defn);
            }

            this.#structs[defn.name] = this.__createStruct(defn);
        } else if (defn.kind === "static_array") {
            const typename = toString(defn);
            const existing = this.__lookupTypename(typename);

            if (existing) {
                throw new TypeDefinedError(defn);
            }

            this.#staticArrays[typename] = this.__createStaticArray(defn);
        } else {
            log(`__addTypeDefn unimplemented for ${toString(defn)}`);
        }
    }

    __resolveTypeDefn(defn: TypeDefn): DefinedType | null {
        if (typeof defn === "string") {
            return this.__lookupTypename(defn);
        } else if (defn.kind === "primitive") {
            return this.#primitives[defn.name] || null;
        } else if (defn.kind === "struct") {
            const existing = this.#structs[defn.name];

            if (existing) {
                return existing;
            }

            return this.__createStruct(defn);
        } else if (defn.kind === "static_array") {
            const existing = this.#staticArrays[toString(defn)];

            if (existing) {
                return existing;
            }

            return this.__createStaticArray(defn);
        } else if (defn.kind === "flex_array") {
            const subType = this.__resolveTypeDefn(defn.elemType);

            if (!subType) {
                throw new TypeNotFoundError(defn.elemType);
            }

            return new FlexArray(this, subType, defn.numElemsFn);
        } else if (defn.kind === "pointer") {
            const subType = this.__resolveTypeDefn(defn.elemType);

            if (!subType) {
                throw new TypeNotFoundError(defn.elemType);
            }

            return new Pointer(this, subType, defn.numElems);
        }

        return null;
    }

    __createStruct(defn: StructDefn): Struct {
        const fields: NamedField[] = [];

        for (const field of defn.defn) {
            const type = this.__resolveTypeDefn(field[0]);

            if (!type) {
                throw new TypeNotFoundError(field[0]);
            }

            fields.push(new NamedField(
                field[1],
                new FieldType(
                    type,
                    this.__sizeof(type),
                    this.__alignof(type)
                )
            ));
        }

        return new Struct(defn.name, this, ...fields);
    }

    __createStaticArray(defn: StaticArrayDefn): StaticArray {
        const subType = this.__resolveTypeDefn(defn.elemType);

        if (!subType) {
            throw new TypeNotFoundError(defn.elemType);
        }

        return new StaticArray(
            this,
            subType,
            defn.numElems
        );
    }

    __lookupTypename(rawTypename: string): DefinedType | null {
        const typename = rawTypename.trim();

        if (typename in this.#primitives) {
            return this.#primitives[typename];
        }

        if (typename in this.#structs) {
            return this.#structs[typename];
        }

        if (typename in this.#staticArrays) {
            return this.#staticArrays[typename];
        }

        if (typename.endsWith("]")) {
            const numElemsStart = typename.lastIndexOf("[") + 1;

            if (numElemsStart === 0) {
                throw new Error(`Bad typename: ${typename}`);
            }

            const numElems = parseInt(typename.substring(numElemsStart, typename.length - 1));

            if (Number.isNaN(numElems)) {
                throw new Error(`Bad array size: ${typename.substring(numElemsStart - 1, typename.length)}`);
            }

            const subTypename = typename.substring(0, numElemsStart - 1);
            const subType = this.__lookupTypename(subTypename);

            if (!subType) {
                return null;
            }

            return new StaticArray(this, subType, numElems);
        }

        if (typename.endsWith("*")) {
            let subTypename = typename.substring(0, typename.length - 1).trim();

            if (subTypename.endsWith(")") && subTypename.startsWith("(")) {
                subTypename = subTypename.substring(1, subTypename.length - 1);
            }

            const subType = this.__lookupTypename(subTypename);

            if (!subType) {
                return null;
            }

            return new Pointer(this, subType);
        }

        return null;
    }

    __sizeof(type: DefinedType): number {
        return type.__size;
    }

    __alignof(type: DefinedType): number {
        return type.__align;
    }

    toString(): string {
        return this.#name;
    }

    get [Symbol.metadataDescriptor]() {
        return {
            Instantiate: {
                PreferShow: true,
                Help: "Instantiate(addr, typename, valname) - evaluates the given memory address as if it had the given type"
            }
        };
    }
}

class TypeDefinedError extends Error {
    readonly #typename: string;

    constructor(defn: TypeDefn) {
        super(`Type is already defined: ${toString(defn)}`);
        this.#typename = toString(defn);
    }

    get Typename(): string {
        return this.#typename;
    }
}

class TypeNotFoundError extends Error {
    readonly #typename: string;

    constructor(defn: TypeDefn) {
        super(`Type not found: ${toString(defn)}`);
        this.#typename = toString(defn);
    }

    get Typename(): string {
        return this.#typename;
    }
}