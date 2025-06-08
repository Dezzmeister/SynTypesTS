// begin bootstrap.js
// "__dirname" and "module" are not defined in WinDbg. The bundled code will attempt
// to assign top-level exports to module.exports, so we need to intercept that and
// put those exports in the global namespace manually.
var __dirname = "";
var module = {
    set exports(val) {
        for (const key in val) {
            globalThis[key] = val[key];
        }
    }
};
// end bootstrap.js
