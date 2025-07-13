import { PLATFORM_ALIGN } from "./consts";
import type { FlexArrayValue } from "./valueclasses/FlexArrayValue";
import type { FlexStringValue } from "./valueclasses/StringValue";

export type TypeDefns = readonly TypeDefn[];
export type TypeDefn = TypeAlias | PrimitiveDefn | StructDefn | ArrayDefn | PointerDefn;

type TypeAlias = string;

// These are bare constants instead of an enum so that they can be
// quick to type. When defining types, it's inconvenient to type out
// an enum name and hit the Shift key multiple times
export const signed = (1 << 0);
export const float = (1 << 1);
export const bool = (1 << 2);
export const char = (1 << 3);

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

export type FlexSizeFn = (arr: FlexArrayValue | FlexStringValue) => number;
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
    primitive("bool", 1, 1, bool),
    primitive("u8", 1, 1),
    primitive("i8", 1, 1, signed),
    primitive("u16", 2, 2),
    primitive("i16", 2, 2, signed),
    primitive("u32", 4, 4),
    primitive("i32", 4, 4, signed),
    primitive("u64", 8, 8),
    primitive("i64", 8, 8, signed),
    primitive("size", 8, 8),
    primitive("uchar", 1, 1, char),
    primitive("char", 1, 1, signed | char),
    primitive("wchar", 2, 2, char),
    primitive("f32", 4, 4, signed | float),
    primitive("f64", 8, 8, signed | float),
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