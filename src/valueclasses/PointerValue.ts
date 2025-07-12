import { POINTER_WIDTH } from "../consts";
import type { Pointer } from "../typeclasses/Pointer";
import type { Value } from "./Value";

export class PointerValue implements Value {
    readonly Addr: host.Int64;
    readonly Type: Pointer;
    readonly Name?: string;
    readonly Parent?: Value;

    readonly #item: Value;

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

        const ptrVal = host.memory.readMemoryValues(
            addr,
            1,
            POINTER_WIDTH,
            false
        );

        this.#item = type.ItemType.Instantiate(ptrVal[0], undefined, this);
    }

    get Pointee(): Value {
        return this.#item;
    }

    toString(): string {
        return this.Addr.toString();
    }
}