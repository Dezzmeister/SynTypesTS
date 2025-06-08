import { PLATFORM_ALIGN } from "./consts";

export type TypeDefns = readonly TypeDefn[];
export type TypeDefn = TypeAlias | PrimitiveDefn | StructDefn | ArrayDefn | PointerDefn;

type TypeAlias = string;

// These are bare constants instead of an enum so that they can be
// quick to type. When defining types, it's inconvenient to type out
// an enum name and hit the Shift key multiple times
export const signed = (1 << 0);
export const float = (1 << 1);

type PrimitiveDefn = {
    kind: "primitive";
    name: string;
    size: number;
    align: number;
    flags: number;
    // TODO: Loader fn?
};

type FieldArg = [type: TypeDefn, name: string];
type StructArgs = FieldArg[];
export type StructDefn = {
    kind: "struct";
    name: string;
    defn: StructArgs;
};

type ArrayDefn = StaticArrayDefn | FlexArrayDefn;
export type StaticArrayDefn = {
    kind: "static_array";
    elemType: TypeDefn;
    numElems: number;
};

// TODO: Type
export type FlexSizeFn = (arr: unknown) => number;
type FlexArrayDefn = {
    kind: "flex_array";
    elemType: TypeDefn;
    numElemsFn: FlexSizeFn;
};

type PointerDefn = {
    kind: "pointer";
    elemType: TypeDefn;
    // This is a convenience for specifying pointers to static arrays
    numElems?: number;
};

export const builtins: TypeDefns = Object.freeze([
    primitive("bool_1", 1, 1),
    primitive("bool_4", 1, 4),
    primitive("bool_8", 1, 8),
    primitive("uchar_1", 1, 1),
    primitive("uchar_4", 1, 4),
    primitive("uchar_8", 1, 8),
    primitive("char_1", 1, 1, signed),
    primitive("char_4", 1, 4, signed),
    primitive("char_8", 1, 8, signed),
    primitive("ushort_2", 2, 2),
    primitive("ushort_4", 2, 4),
    primitive("ushort_8", 2, 8),
    primitive("short_2", 2, 2, signed),
    primitive("short_4", 2, 4, signed),
    primitive("short_8", 2, 8, signed),
    primitive("uint_4", 4, 4),
    primitive("uint_8", 4, 8),
    primitive("int_4", 4, 4, signed),
    primitive("int_8", 4, 8, signed),
    primitive("ulong", 8, 8),
    primitive("long", 8, 8, signed),
    primitive("size", 8, 8),
    primitive("wchar_2", 2, 2),
    primitive("wchar_4", 2, 4),
    primitive("wchar_8", 2, 8),
    primitive("float_4", 4, 4, signed | float),
    primitive("float_8", 4, 8, signed | float),
    primitive("double", 8, 8, signed | float),
    primitive("void", 0, 0)
]);

export function primitive(
    name: string,
    size: number,
    align = PLATFORM_ALIGN,
    flags = 0
): PrimitiveDefn {
    return {
        kind: "primitive",
        name,
        size,
        align,
        flags
    };
}

export function struct(name: string, defn: StructArgs): StructDefn {
    return {
        kind: "struct",
        name,
        defn
    };
}

export function array(elemType: TypeDefn, numElems: number): ArrayDefn;
export function array(elemType: TypeDefn, numElemsFn: FlexSizeFn): ArrayDefn;
export function array(elemType: TypeDefn, numElemsOrFn: number | FlexSizeFn): ArrayDefn {
    if (typeof numElemsOrFn === "function") {
        return {
            kind: "flex_array",
            elemType,
            numElemsFn: numElemsOrFn
        };
    }

    return {
        kind: "static_array",
        elemType,
        numElems: numElemsOrFn
    };
}

export function ptr(elemType: TypeDefn, numElems?: number): PointerDefn {
    return {
        kind: "pointer",
        elemType,
        numElems
    };
}

export function toString(defn: TypeDefn): string {
    if (typeof defn === "string") {
        return defn;
    }

    switch (defn.kind) {
        case "pointer":
            return defn.numElems ? `*(${toString(defn.elemType)}[${defn.numElems}])` : `*${toString(defn.elemType)}`;
        case "static_array":
            return `${toString(defn.elemType)}[${defn.numElems}]`;
        case "flex_array":
            return `${toString(defn.elemType)}[(func)]`;
        default:
            return defn.name;
    }
}