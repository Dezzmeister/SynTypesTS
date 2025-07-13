import type { DefinedType } from "../typeclasses/DefinedType";

export interface Value {
    get Addr(): host.Int64;
    get Type(): DefinedType;
    readonly Name?: string;
    readonly Parent?: Value;

    __eval(): void;
}