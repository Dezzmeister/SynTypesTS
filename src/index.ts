import { SynTypesTS } from "./syntypes";

const synTypesTS = new SynTypesTS();

export function initializeScript() {
    return [
        new host.apiVersionSupport(1, 9),
        new host.namespacePropertyParent(
            {
                get SynTypesTS(): SynTypesTS {
                    return synTypesTS;
                }
            },
            "Debugger.Models.Utility",
            "Debugger.Models.Utility.Analysis",
            "Analysis"
        )
    ];
}