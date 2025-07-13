/// <reference types="../script_context.d.ts" />

// Create a type table from this script with
//      dx -r1 Debugger.Utility.Analysis.SynTypesTS.ReadTypes("example", "C:\\..\\example_struct.js");
// You can then instantiate the type with
//      dx -r1 Debugger.Utility.Analysis.SynTypesTS.TypeTables.example.Instantiate(0x000001289ac861a0, "items", "some_items");
// 0x000001289ac861a0 is the address of an "items" struct

/*
    struct items {
        int x;
        float f;
        struct {
            unsigned char b;
        } s;
        int ints[20];
        const wchar_t * str_ptr;
        char str_arr[40];
        int flex[];
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
        // Static arrays can also be declared with the `array` function
        ["i32[20]", "ints"],
        // Pointers can also be declared with the `ptr` function
        ["wchar*", "str_ptr"],
        ["char[40]", "str_arr"],
        // This is a flexible array member which will always have 10 elements.
        // The function that determines the size of the array can walk the value
        // tree to determine how big the array should be
        [array("i32", () => 10), "flex"]
    ])
]);