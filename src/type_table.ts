import { PLATFORM_ALIGN, POINTER_WIDTH } from "./consts";
import { log } from "./logging";
import { FlexSizeFn, StaticArrayDefn, StructDefn, type TypeDefn, float, signed, toString } from "./type_defn";

interface DefinedType {
    get __name(): string;
    get __size(): number;
    get __align(): number;
}

class Primitive implements DefinedType {
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

class FieldType {
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

class NamedField {
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

    toString(): string {
        return this.#name;
    }
}

class Struct implements DefinedType {
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

    get __name(): string {
        return this.#name;
    }

    get __size(): number {
        return this.#size;
    }

    get __align(): number {
        return this.#align;
    }

    toString(): string {
        return `${this.#name} (Size: ${this.__size}, Align: ${this.__align})`;
    }
}

class StaticArray implements DefinedType {
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

    get __name(): string {
        return `${this.#elemType.__name}[${this.#numElems}]`;
    }

    get __size(): number {
        return this.#size;
    }

    get __align(): number {
        return this.#align;
    }

    toString(): string {
        return `${this.__name} (Size: ${this.#size}, Align: ${this.#align})`;
    }
}

class FlexArray implements DefinedType {
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

    get __name(): string {
        return `${this.#elemType.__name}[(func)]`;
    }

    get __size(): number {
        return 0;
    }

    get __align(): number {
        return this.#align;
    }

    toString(): string {
        return `${this.__name} (Size: ${this.Size}, Align: ${this.#align})`;
    }
}

class Pointer implements DefinedType {
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

    toString(): string {
        return `${this.__name} (Size: ${this.__size}, Align: ${this.__align})`;
    }
}

export class TypeTable {
    readonly #name: string;
    readonly #primitives: Record<string, Primitive> = {};
    readonly #structs: Record<string, Struct> = {};
    readonly #staticArrays: Record<string, StaticArray> = {};

    constructor(
        name: string
    ) {
        this.#name = name;

        const primitives = this.#primitives;
        const structs = this.#structs;
        const staticArrays = this.#staticArrays;

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