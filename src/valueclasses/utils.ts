export function checkAlign(addr: host.Int64, align: number) {
    const addrAsNum = addr.asNumber();

    if (addrAsNum % align !== 0) {
        host.diagnostics.debugLog(
            `Warning: ${addr} is not aligned to ${align} bytes`
        );
    }
}