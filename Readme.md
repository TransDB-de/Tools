# Trans-db Tools

## Content

* [About](#about)
* [GeoDbJson](#geodbjson)
* [EntryGenerator](#entrygenerator)

## About

This repository conatins a collection of [deno](https://deno.land/) scripts or node applications, meant to aid the project in various ways.
The scripts require no additional dependencies.

You will find compiled windows binaries of the tools under [releases](https://github.com/TransDB-de/Tools/releases).
The deno compile feature is experimental! Some tools may not behave as expected.

Note, that due to how deno handles third-party modules, running a script for the first time requires an internet connection.

## GeoDbJson

### Info

Download the 'DE.tab' entries from [OpenGeoDb](http://opengeodb.giswiki.org/wiki/OpenGeoDB) and converts them into a JSON format more suitable to the project.
Only the used fields are imported, and the "lat" and "lon" fields are converted to a [GeoJSON](https://geojson.org/) point object.

### Usage

Use `deno run -A GeoDbJson/main.ts` to run the script, or download a compiled binary and run it. The resulting JSON document will appear in the current working directory.

### Download

You can also download the JSON document directly from [releases](https://github.com/TransDB-de/Tools/releases/download/0.2.0/OpenGeoDb_DE_JSON.zip).

## EntryGenerator

The entry generator generates random entries for test purposes and save it into a JSON file.

### Usage

1. Clone the repo
2. `cd EntryGenerator`
3. `npm install`
4. `node main.js <arguments>`
   
### Arguments
- `-c <count>, --count <count>` Integer that defines how many entries should be generated
- `-f, --format` Format entries in JSON file with indent and line breaks
- `-a <percent>, --approved <percent>` The percentage of entries that are approved by default