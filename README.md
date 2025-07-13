# SynTypesTS

This is an extension for WinDbg based on [SynTypes](https://github.com/microsoft/WinDbg-Samples/tree/master/SyntheticTypes),
which comes with WinDbg. SynTypesTS differs from SynTypes in that it:

 - Is written in Typescript
 - Uses Javascript modules instead of a single Javascript file
 - Supports flexible array members whose size can be computed when the type is
   instantiated
 - Expects type definitions in Javascript files rather than header files
 - Doesn't have a C parser

I built this because I needed to debug a program without symbol information,
which uses structs with flexible array members whose sizes depend on adjacent
members.

## Building + Running

1. Install or switch to Node 22. The project may be buildable on other versions
   of Node, but I'm using Node 22.16.0.

2. Install dependencies:

   ```cmd
   npm i
   ```

2. Run the build command. This will do two things: it will first compile the
   Typescript source files and bundle the output into a single index.js (with
   @vercel/ncc), then it will copy the contents of bootstrap.js to the top of
   index.js. bootstrap.js is needed to define some global constants that don't
   exist in the WinDbg scripting environment, but are assumed to exist by
   webpack (via ncc).

   ```cmd
   npm run build
   ```

   (This general build process has been moved into a template repo for
   Typescript WinDbg extensions:
   [windbg-ts-template](https://github.com/Dezzmeister/windbg-ts-template).)

3. Get the absolute path of index.js and load it in WinDbg:

   ```
   .scriptload C:\...\index.js
   ```

4. To define a type table, see [Defining Type Tables](#defining-type-tables).

## Defining Type Tables

To create a type table, you can invoke `SynTypesTS.ReadTypes`:

```
dx -r1 Debugger.Utility.Analysis.SynTypesTS.ReadTypes("example", "C:\\..\\example\\example_struct.js")
```

[example_struct.js](./example/example_struct.js) is an example script that defines a struct with
a few members of various types. Type definitions for constants and functions
available to type definition scripts can be found in `./script_context.d.ts`.

After you define a type table, you can query it and inspect the types you've
defined:

```
dx -r1 Debugger.Utility.Analysis.SynTypesTS.TypeTables.example
```

Once you've defined a type, you can instantiate it somewhere in memory:

```
dx -r1 Debugger.Utility.Analysis.SynTypesTS.TypeTables.example.Instantiate(addr, typename, name)
```

Type instantiation is lazy, so if you have a deeply-nested struct or some other
complex type, only those parts that are accessed will be evaluated.

## TODOs

 - Validation of script inputs (flexible array member placement, char sizes,
   etc.)
 - Unions