/// <reference types="../script_context.d.ts" />

/*
    struct items {
        int x;
        float f;
        struct {
            unsigned char b;
        } s;
        int ints[20];
    };
*/

ReturnTypeDefns([
    ...builtins,
    struct("items", [
        ["i32", "x"],
        ["f32", "f"],
        [struct("_items_s", [
            ["uchar", "b"]
        ]), "s"],
        ["i32[20]", "ints"]
    ])
]);