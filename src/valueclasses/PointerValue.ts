import { POINTER_WIDTH } from "../consts";
import type { Pointer } from "../typeclasses/Pointer";
import { Primitive } from "../typeclasses/Primitive";
import { PointerStringValue } from "./StringValue";
import { evalIfStruct } from "./StructValue";
import type { Value } from "./Value";

export function createPointerValue(
    addr: host.Int64,
    type: Pointer,
    name?: string,
    parent?: Value
): PointerValue | PointerStringValue {
    if (type.ItemType instanceof Primitive && type.ItemType.IsChar) {
        return new PointerStringValue(
            addr,
            type,
            name,
            parent
        );
    }

    return new PointerValue(
        addr,
        type,
        name,
        parent
    );
}

export class PointerValue implements Value {
    readonly Addr: host.Int64;
    readonly Type: Pointer;
    readonly Name?: string;
    readonly Parent?: Value;

    // Undefined: the pointer has not been evaluated yet
    // Null: the pointer is null
    // Value: the pointee
    #item?: Value | null;

    constructor(
        addr: host.Int64,
        type: Pointer,
        name?: string,
        parent?: Value
    ) {
        this.Addr = addr;
        this.Type = type;
        this.Name = name;
        this.Parent = parent;
    }

    get Pointee(): Value | null {
        const item = this.__eval();
        return item;
    }

    toString(): string {
        return this.Addr.toString();
    }

    __eval(): Value | null {
        if (this.Addr.asNumber() === 0) {
            this.#item = null;
        } else {
            const ptrVal = host.memory.readMemoryValues(
                this.Addr,
                1,
                POINTER_WIDTH,
                false
            );

            this.#item = this.Type.ItemType.Instantiate(
                ptrVal[0],
                undefined,
                this
            );
            evalIfStruct(this.#item);
        }

        return this.#item;
    }
}