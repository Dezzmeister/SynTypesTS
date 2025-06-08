// This file contains type definitions to be used by scripts that define
// type tables.

// Primitive flags
declare const signed: number;
declare const float: number;

// Builtin types. Put these at the beginning of your type table if you
// want to use them, e.g.:
// ReturnTypeDefns([...builtins, (your types)]);
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

/**
 * Defines a new primitive type. Any types defined after this primitive
 * can refer to it by name.
 * 
 * @param name
 * @param size
 * @param align
 * @param flags A bitfield defining characteristics of the new primitive. Can
 *   be any combination of `signed` and `float`.
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
declare function array(elemType: TypeDefn, numElemsFn: (this: unknown) => number): ArrayDefn;

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