# SynTypesTS

This is an extension for WinDbg based on [SynTypes](https://github.com/microsoft/WinDbg-Samples/tree/master/SyntheticTypes),
which comes with WinDbg. SynTypesTS differs from SynTypes in that it:

 - Is written in Typescript
 - Uses Javascript modules instead of a single Javascript file
 - Supports flexible array members whose size can be computed when the type is instantiated
 - Expects type definitions in Javascript files rather than header files
 - Doesn't have a C parser

## Building + Running

1. Install or switch to Node 22. The project may be buildable on other versions of Node,
   but I'm using Node 22.16.0.

2. Install dependencies:

   ```cmd
   npm i
   ```

2. Run the build command. This will do two things: it will first compile the Typescript source
   files and bundle the output into a single index.js (with @vercel/ncc), then it will copy
   the contents of bootstrap.js to the top of index.js. bootstrap.js is needed to define some
   global constants that don't exist in the WinDbg scripting environment, but are assumed to exist
   by webpack (via ncc).

   ```cmd
   npm run build
   ```

3. Get the absolute path of index.js and load it in WinDbg:

   ```
   .scriptload C:\...\index.js
   ```

4. To define a type table, see [Defining Type Tables](#defining-type-tables).

## Defining Type Tables

To create a type table, you can invoke `SynTypesTS.ReadTypes`:

```
dx -r1 Debugger.Utility.Analysis.SynTypesTS.ReadTypes("test_table", "C:\\..\\example\\schedule_one_types.js")
```

`./example/schedule_one_types.js` is an example script that defines a few types. Type definitions
for constants and functions available to type definition scripts can be found in `./script_context.d.ts`.

After you define a type table, you can query it and inspect the types you've defined:

```
dx -r1 Debugger.Utility.Analysis.SynTypesTS.TypeTables
```

TODO: Instantiate types