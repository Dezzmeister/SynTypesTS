/// <reference types="./lib/JsProvider64.d.ts"/>
/// <reference types="./lib/dynamic.d.ts"/>
// This file contains type definitions to be used by scripts that define
// type tables.

// Primitive flags
declare const signed: number;
declare const float: number;
declare const bool: number;
declare const char: number;

// Builtin types. Put these at the beginning of your type table if you
// want to use them, e.g.:
// ReturnTypeDefns([...builtins, (your types)]);
// The builtin types are:
//      bool        (size: 1, align: 1, bool)
//      u8          (size: 1, align: 1)
//      i8          (size: 1, align: 1, signed)
//      u16         (size: 2, align: 2)
//      i16         (size: 2, align: 2, signed)
//      u32         (size: 4, align: 4)
//      i32         (size: 4, align: 4, signed)
//      u64         (size: 8, align: 8)
//      i64         (size: 8, align: 8, signed)
//      size        (size: 8, align: 8)
//      uchar       (size: 1, align: 1, char)
//      char        (size: 1, align: 1, signed, char)
//      wchar       (size: 2, align: 2, char)
//      f32         (size: 4, align: 4, signed, float)
//      f64         (size: 8, align: 8, signed, float)
//      void        (size: 0, align: 0)
// `void` is only represented as a primitive so that void pointers don't
// need to be treated differently. You shouldn't use `void` except as the
// type of a pointee.
declare const builtins: readonly TypeDefn[];

type TypeDefn = TypeAlias | PrimitiveDefn | StructDefn | ArrayDefn | PointerDefn;
type TypeAlias = string;

type PrimitiveDefn = {
    /**
     * @internal
     * @hidden
     */
    readonly __brand: unique symbol;
};

// A struct field. The type can be a constructed type definition,
// an alias for a previously defined type, or a string naming a
// pointer or static array type, like "long *" or "wchar_2[256]".
type FieldArg = [name: string, type: TypeDefn];
type StructArgs = FieldArg[];
type StructDefn = {
    /**
     * @internal
     * @hidden
     */
    readonly __brand: unique symbol;
};

type ArrayDefn = {
    /**
     * @internal
     * @hidden
     */
    readonly __brand: unique symbol;
};

type PointerDefn = {
    /**
     * @internal
     * @hidden
     */
    readonly __brand: unique symbol;
};

interface DefinedType {
    get __name(): string;
    get __size(): number;
    get __align(): number;
}

interface Value {
    get Addr(): host.Int64;
    get Type(): DefinedType;
    readonly Name?: string;
    readonly Parent?: Value;
}

type FlexSizeFn = (arr: FlexArrayValue | FlexStringValue) => number;

declare class FlexArray implements DefinedType {
    private constructor();

    get __name(): string;
    // Always returns zero for a flex array. Use the sizeFn on
    // a value to get the actual size
    get __size(): number;
    get __align(): number;

    get __sizeFn(): FlexSizeFn;
    get __elemType(): DefinedType;
}

declare class Pointer implements DefinedType {
    private constructor();

    get __name(): string;
    get __size(): number;
    get __align(): number;

    get __itemType(): DefinedType;
}

declare class Primitive implements DefinedType {
    private constructor();

    get __name(): string;
    get __size(): number;
    get __align(): number;

    get IsSigned(): boolean;
    get IsFloat(): boolean;
    get IsBool(): boolean;
    get IsChar(): boolean;
}

declare class StaticArray implements DefinedType {
    private constructor();

    get __name(): string;
    get __size(): number;
    get __align(): number;

    get __elemType(): DefinedType;
}

type NamedField = {
    get __name(): string;
    get __type(): DefinedType;
};

declare class Struct implements DefinedType {
    private constructor();

    get __name(): string;
    get __size(): number;
    get __align(): number;

    get __fields(): NamedField[];
}

declare class FlexArrayValue implements Value {
    private constructor();

    get Addr(): host.Int64;
    get Type(): FlexArray;
    readonly Name?: string;
    // This should always be a StructValue
    readonly Parent?: Value;
    get __size(): number;
    [Symbol.iterator](): Generator<Value>;
}

declare class FlexStringValue implements Value {
    private constructor();

    get Addr(): host.Int64;
    get Type(): FlexArray;
    readonly Name?: string;
    // This should always be a StructValue
    readonly Parent?: Value;
    get Value(): string;
    get __size(): number;
}

declare class PointerValue implements Value {
    private constructor();

    get Addr(): host.Int64;
    get Type(): Pointer;
    readonly Name?: string;
    readonly Parent?: Value;
    get Pointee(): Value | null;
}

declare class PointerStringValue implements Value {
    private constructor();

    get Addr(): host.Int64;
    get Type(): Pointer;
    readonly Name?: string;
    readonly Parent?: Value;
    get Pointee(): string | null;
}

declare class IntValue implements Value {
    private constructor();

    get Addr(): host.Int64;
    get Type(): Primitive;
    readonly Name?: string;
    readonly Parent?: Value;
    get Value(): host.Int64;
}

declare class FloatValue implements Value {
    private constructor();

    get Addr(): host.Int64;
    get Type(): Primitive;
    readonly Name?: string;
    readonly Parent?: Value;
    get Value(): number;
}

declare class BoolValue implements Value {
    private constructor();

    get Addr(): host.Int64;
    get Type(): Primitive;
    readonly Name?: string;
    readonly Parent?: Value;
    get Value(): boolean;
}

declare class CharValue implements Value {
    private constructor();

    get Addr(): host.Int64;
    get Type(): Primitive;
    readonly Name?: string;
    readonly Parent?: Value;
    get Value(): string;
}

declare class VoidValue implements Value {
    private constructor();

    get Addr(): host.Int64;
    get Type(): Primitive;
    readonly Parent?: Value;
}

declare class StaticArrayValue implements Value {
    private constructor();

    get Addr(): host.Int64;
    get Type(): StaticArray;
    readonly Name?: string;
    readonly Parent?: Value;
    [Symbol.iterator](): Generator<Value>;
}

declare class StaticStringValue implements Value {
    private constructor();

    get Addr(): host.Int64;
    get Type(): StaticArray;
    readonly Name?: string;
    readonly Parent?: Value;
    get Value(): string;
}

declare class FieldValue {
    readonly Addr: host.Int64;
    readonly Type: DefinedType;
    readonly Name: string;
    readonly Parent: StructValue;
    readonly Value: Value;
}

declare class StructValue implements Value {
    private constructor();

    get Addr(): host.Int64;
    get Type(): Struct;
    readonly Name: string;
    readonly Parent?: Value;
    get __fields(): readonly FieldValue[];
}

/**
 * Defines a new primitive type. Any types defined after this primitive
 * can refer to it by name.
 * 
 * @param name
 * @param size
 * @param align
 * @param flags A bitfield defining characteristics of the new primitive. Can
 *   be any combination of `signed`, `float`, `bool`, and `char`.
 */
declare function primitive(name: string, size: number, align?: number, flags?: number): PrimitiveDefn;

/**
 * Defines a new struct type. Trailing padding and padding between members
 * will be added if necessary. Any types defined after this struct can refer
 * to it by name (without a "struct" prefix).
 * 
 * @param name
 * @param defn The struct's members
 */
declare function struct(name: string, defn: StructArgs): StructDefn;

/**
 * Defines an array with a fixed size.
 * 
 * @param elemType Type of a single element
 * @param numElems Number of elements in the array
 */
declare function array(elemType: TypeDefn, numElems: number): ArrayDefn;

/**
 * Defines the type of a flexible array member.
 * 
 * @param elemType Type of a single element
 * @param numElemsFn Function to compute the size of the array
 */
declare function array(elemType: TypeDefn, numElemsFn: FlexSizeFn): ArrayDefn;

/**
 * Defines a pointer type.
 * 
 * @param elemType Type of the pointee
 * @param numElems If provided, this will be a pointer to a static array of
 *      `elemType`.
 */
declare function ptr(elemType: TypeDefn, numElems?: number): PointerDefn;

/**
 * "Returns" the type definitions from the script. You must call this to register
 * your type table.
 * 
 * @param defns Type definitions which will make up the type table
 */
declare function ReturnTypeDefns(defns: readonly TypeDefn[]): void;