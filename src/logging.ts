export function log(...args: unknown[]): void {
    host.diagnostics.debugLog(...args, "\n");
}