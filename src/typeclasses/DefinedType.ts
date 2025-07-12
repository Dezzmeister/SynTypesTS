import type { Value } from "../valueclasses/Value";

export interface DefinedType {
    Instantiate(
        addr: host.Int64,
        name?: string,
        parent?: Value
    ): Value;

    get __name(): string;
    get __size(): number;
    get __align(): number;
}