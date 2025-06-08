// This file contains type declarations for dynamic objects in the Debugger namespace
// and augmentations for built-in types which are not fully documented in JsProvider.d.ts.
// The Debugger objects given here seem to be provided by WinDbg itself, and so are effectively
// static.

interface SymbolConstructor {
    readonly metadataDescriptor: unique symbol;
}

declare namespace host {
    interface Int64 {
        toString(): string;
        add(num: IntNumeric): Int64;
        asNumber(): number;
        bitwiseAnd(num: IntNumeric): Int64;
        bitwiseNot(): Int64;
        bitwiseOr(num: IntNumeric): Int64;
        bitwiseShiftLeft(amount: IntNumeric): Int64;
        bitwiseShiftRight(amount: IntNumeric): Int64;
        bitwiseXor(num: IntNumeric): Int64;
        compareTo(num: IntNumeric): -1 | 0 | 1;
        convertToNumber(): number;
        divide(num: IntNumeric): Int64;
        getHighPart(): Int64;
        getLowPart(): Int64;
        modulo(num: IntNumeric): Int64;
        multiply(num: IntNumeric): Int64;
        subtract(num: IntNumeric): Int64;
        valueOf(): number;
    }
}

type FileDisposition = "OpenExisting" | "CreateNew" | "CreateAlways";
type TextEncoding = "Ascii" | "Utf8" | "Utf16";

interface debuggerInterface {
    Utility: {
        // https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/dbgmodel-namespace-file-system
        FileSystem: {
            CreateFile(path: string, disposition?: FileDisposition): file;
            CreateTempFile(): file;
            // Default encoding is "Ascii"
            CreateTextReader(fileOrPath: file | string, encoding?: TextEncoding): TextReader;
            DeleteFile(path: string): void;
            FileExists(path: string): boolean;
            OpenFile(path: string): file;
        }
    }
}

interface file {
    /**
     * @internal
     * @hidden
     */
    readonly __brand: unique symbol;

    get Extension(): string;
    get Name(): string;
    get Path(): string;
    get Position(): host.Int64;
    get Size(): host.Int64;

    Close(): void;
    Open(disposition?: FileDisposition): void;
    Delete(): void;
    // Reads "n" bytes at the current position and advances the position.
    ReadBytes(n: number): ByteList;
    // Writes the given bytes to the current position and advances the position.
    WriteBytes(bytes: number[] | ByteList, byteCount?: number): void;
    ToDisplayString(): string;

    toString(): string;
    // TODO: Unknown methods
}

interface Collection<T> {
    [Symbol.iterator](): Generator<T>;

    Aggregate(reducer: (a: T, b: T) => T): T;
    All(predicate: (val: T) => boolean): boolean;
    Any(predicate: (val: T) => boolean): boolean;
    Contains(val: T): boolean;
    // TODO: Unknown methods
}

// This class consumes elements when iterating over them. Any method that
// iterates over elements to obtain a result will consume the elements.
interface LineCollection extends Collection<string> {
    /**
     * @internal
     * @hidden
     */
    readonly __brand: unique symbol;
    // TODO: Unknown methods
}

interface ByteList extends Collection<number> {
    /**
     * @internal
     * @hidden
     */
    readonly __brand: unique symbol;

    readonly [index: number]: number;

    Average(): number;
    Contains(val: host.IntNumeric): boolean;
    Count(): host.Int64;
    // Returns a copy of this array without duplicate bytes.
    Distinct(): ByteList;
    // I think this returns a copy of this array with the given bytes removed from
    // the beginning.
    Except(bytes: number[] | ByteList): ByteList;
    First(): number;
    Intersect(bytes: ByteList): ByteList;
    Last(): number;
    Max(): number;
    Min(): number;
    Reverse(): ByteList;
    Union(bytes: ByteList): ByteList;
    // Returns the byte at the given index. Returns 0 when index == Count(),
    // and throws an error when index > Count().
    getValueAt(index: number): number;
    // TODO: Unknown methods
}

interface TextReader {
    /**
     * @internal
     * @hidden
     */
    readonly __brand: unique symbol;

    ReadLine(): string;
    ReadLineContents(): LineCollection;
    // TODO: Unknown methods
}