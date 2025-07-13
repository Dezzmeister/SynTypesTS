import type {
    builtins,
    signed,
    float,
    primitive,
    struct,
    array,
    ptr,
    TypeDefns
} from "./type_defn";
import type { FlexArray } from "./typeclasses/FlexArray";
import type { Pointer } from "./typeclasses/Pointer";
import type { Primitive } from "./typeclasses/Primitive";
import type { StaticArray } from "./typeclasses/StaticArray";
import type { Struct } from "./typeclasses/Struct";
import type { FlexArrayValue } from "./valueclasses/FlexArrayValue";
import type { PointerValue } from "./valueclasses/PointerValue";
import type {
    IntValue,
    FloatValue,
    BoolValue,
    CharValue,
    VoidValue
 } from "./valueclasses/PrimitiveValue";
import type { StaticArrayValue } from "./valueclasses/StaticArrayValue";
import type { StructValue } from "./valueclasses/StructValue";
import type {
    FlexStringValue,
    StaticStringValue,
    PointerStringValue
} from "./valueclasses/StringValue";

export class EvalContext {
    readonly #signed: typeof signed;
    readonly #float: typeof float;
    readonly #primitive: typeof primitive;
    readonly #struct: typeof struct;
    readonly #array: typeof array;
    readonly #ptr: typeof ptr;
    readonly #builtins: typeof builtins;
    readonly #FlexArray: typeof FlexArray;
    readonly #Pointer: typeof Pointer;
    readonly #Primitive: typeof Primitive;
    readonly #StaticArray: typeof StaticArray;
    readonly #Struct: typeof Struct;
    readonly #FlexArrayValue: typeof FlexArrayValue;
    readonly #FlexStringValue: typeof FlexStringValue;
    readonly #PointerValue: typeof PointerValue;
    readonly #PointerStringValue: typeof PointerStringValue;
    readonly #IntValue: typeof IntValue;
    readonly #FloatValue: typeof FloatValue;
    readonly #BoolValue: typeof BoolValue;
    readonly #CharValue: typeof CharValue;
    readonly #VoidValue: typeof VoidValue;
    readonly #StaticArrayValue: typeof StaticArrayValue;
    readonly #StaticStringValue: typeof StaticStringValue;
    readonly #StructValue: typeof StructValue;
    #typeDefnsOut: TypeDefns | null = null;

    constructor(
        _signed: typeof signed,
        _float: typeof float,
        _primitive: typeof primitive,
        _struct: typeof struct,
        _array: typeof array,
        _ptr: typeof ptr,
        _builtins: typeof builtins,
        _FlexArray: typeof FlexArray,
        _Pointer: typeof Pointer,
        _Primitive: typeof Primitive,
        _StaticArray: typeof StaticArray,
        _Struct: typeof Struct,
        _FlexArrayValue: typeof FlexArrayValue,
        _FlexStringValue: typeof FlexStringValue,
        _PointerValue: typeof PointerValue,
        _PointerStringValue: typeof PointerStringValue,
        _IntValue: typeof IntValue,
        _FloatValue: typeof FloatValue,
        _BoolValue: typeof BoolValue,
        _CharValue: typeof CharValue,
        _VoidValue: typeof VoidValue,
        _StaticArrayValue: typeof StaticArrayValue,
        _StaticStringValue: typeof StaticStringValue,
        _StructValue: typeof StructValue
    ) {
        this.#signed = _signed;
        this.#float = _float;
        this.#primitive = _primitive;
        this.#struct = _struct;
        this.#array = _array;
        this.#ptr = _ptr;
        this.#builtins = _builtins;
        this.#FlexArray = _FlexArray;
        this.#Pointer = _Pointer;
        this.#Primitive = _Primitive;
        this.#StaticArray = _StaticArray;
        this.#Struct = _Struct;
        this.#FlexArrayValue = _FlexArrayValue;
        this.#FlexStringValue = _FlexStringValue;
        this.#PointerValue = _PointerValue;
        this.#PointerStringValue = _PointerStringValue;
        this.#IntValue = _IntValue;
        this.#FloatValue = _FloatValue;
        this.#BoolValue = _BoolValue;
        this.#CharValue = _CharValue;
        this.#VoidValue = _VoidValue;
        this.#StaticArrayValue = _StaticArrayValue;
        this.#StaticStringValue = _StaticStringValue;
        this.#StructValue = _StructValue;
    }

    // TODO: Verify types
    ReturnTypeDefns(defns: TypeDefns): void {
        this.#typeDefnsOut = defns;
    }

    __eval(jsSource: string): TypeDefns | null {
        // These are passed from outside and not imported directly to prevent
        // scripts from reassigning the imported references
        const signed = this.#signed;
        const float = this.#float;
        const primitive = this.#primitive;
        const struct = this.#struct;
        const array = this.#array;
        const ptr = this.#ptr;
        const builtins = this.#builtins;
        const FlexArray = this.#FlexArray;
        const Pointer = this.#Pointer;
        const Primitive = this.#Primitive;
        const StaticArray = this.#StaticArray;
        const Struct = this.#Struct;
        const FlexArrayValue = this.#FlexArrayValue;
        const FlexStringValue = this.#FlexStringValue;
        const PointerValue = this.#PointerValue;
        const PointerStringValue = this.#PointerStringValue;
        const IntValue = this.#IntValue;
        const FloatValue = this.#FloatValue;
        const BoolValue = this.#BoolValue;
        const CharValue = this.#CharValue;
        const VoidValue = this.#VoidValue;
        const StaticArrayValue = this.#StaticArrayValue;
        const StaticStringValue = this.#StaticStringValue;
        const StructValue = this.#StructValue;
        const ReturnTypeDefns = this.ReturnTypeDefns.bind(this);

        (() => {
            eval(jsSource);
        }).call(null);

        return this.#typeDefnsOut;
    }
}