/// <reference types="../script_context.d.ts" />

ReturnTypeDefns([
    ...builtins,
    struct("UnityEngine_Vector2_Fields", [
        ["float_4", "x"],
        ["float_4", "y"]
    ]),
    struct("UnityEngine_Vector2_o", [
        ["UnityEngine_Vector2_Fields", "fields"]
    ]),
    struct("UnityEngine_Color_Fields", [
        ["float_4", "r"],
        ["float_4", "g"],
        ["float_4", "b"],
        ["float_4", "a"]
    ]),
    struct("UnityEngine_Color_o", [
        ["UnityEngine_Color_Fields", "fields"]
    ]),
    struct("Test_Struct", [
        ["wchar_2[8]", "chars"],
        ["bool_1", "bool"],
        [ptr("int_4", 20), "inline_array"],
        ["void *", "void_ptr"],
        [array("long", () => 40), "flex_array"]
    ])
]);