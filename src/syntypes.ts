import { EvalContext } from "./eval_context";
import { log } from "./logging";
import { TypeTable } from "./type_table";
import {
    builtins,
    signed,
    float,
    primitive,
    struct,
    array,
    ptr
} from "./type_defn";
import { FlexArray } from "./typeclasses/FlexArray";
import { Pointer } from "./typeclasses/Pointer";
import { Primitive } from "./typeclasses/Primitive";
import { StaticArray } from "./typeclasses/StaticArray";
import { Struct } from "./typeclasses/Struct";
import { FlexArrayValue } from "./valueclasses/FlexArrayValue";
import { PointerValue } from "./valueclasses/PointerValue";
import {
    IntValue,
    FloatValue,
    BoolValue,
    CharValue,
    VoidValue
 } from "./valueclasses/PrimitiveValue";
import { StaticArrayValue } from "./valueclasses/StaticArrayValue";
import { StructValue } from "./valueclasses/StructValue";
import {
    FlexStringValue,
    PointerStringValue,
    StaticStringValue
} from "./valueclasses/StringValue";

export class SynTypesTS {
    readonly #typeTables: Record<string, TypeTable> = {};

    constructor() {
        Object.setPrototypeOf(this.#typeTables, {
            toString(): string {
                return "TypeTables";
            }
        });
    }

    get TypeTables(): Record<string, TypeTable> {
        return this.#typeTables;
    }

    ReadTypes(tableName: string, path: string): void {
        if (arguments.length < 2) {
            throw new Error("2 arguments required");
        }

        if (tableName in this.#typeTables) {
            throw new Error(`Type table with name ${tableName} already exists`);
        }

        // TODO: Refactor to use explicit resource management
        const file = host.namespace.Debugger.Utility.FileSystem.CreateFile(path, "OpenExisting");
        try {
            if (file.Extension !== "js") {
                throw new Error("Expected a .js file");
            }

            const reader = host.namespace.Debugger.Utility.FileSystem.CreateTextReader(file);
            let jsSource = "";

            for (const line of reader.ReadLineContents()) {
                jsSource += line + "\n";
            }

            const context = new EvalContext(
                signed,
                float,
                primitive,
                struct,
                array,
                ptr,
                builtins,
                FlexArray,
                Pointer,
                Primitive,
                StaticArray,
                Struct,
                FlexArrayValue,
                FlexStringValue,
                PointerValue,
                PointerStringValue,
                IntValue,
                FloatValue,
                BoolValue,
                CharValue,
                VoidValue,
                StaticArrayValue,
                StaticStringValue,
                StructValue
            );

            const defns = context.__eval(jsSource);

            if (!defns) {
                throw new Error("Script did not call ReturnTypeDefns");
            }

            const table = new TypeTable(tableName);

            for (const defn of defns) {
                table.__addTypeDefn(defn);
            }

            this.#typeTables[tableName] = table;
            log(`Registered type table with name ${tableName}`);
        } finally {
            file.Close();
        }
    }

    toString(): string {
        return "SynTypesTS";
    }

    get [Symbol.metadataDescriptor]() {
        return {
            ReadTypes: {
                PreferShow: true,
                Help: "ReadTypes(tableName, path) - evaluates the given JS file and constructs a type table with the given table name"
            }
        };
    }
}