# Trans-db Tools

## Content

* [About](#about)
* [GeoDbJson](#geodbjson)

## About

This repository conatins a collection of [deno](https://deno.land/) scripts, meant to aid the project in various ways.
The scripts require no additional dependencies.

You will find compiled windows binaries of the tools under [releases](https://github.com/TransDB-de/Tools/releases).
The deno compile feature is experimental! Some tools may not behave as expected.

Note, that due to how deno handles third-party modules, running a script for the first time requires an internet connection.

## GeoDbJson

### Info

Donloads the 'DE.tab' entries from [OpenGeoDb](http://opengeodb.giswiki.org/wiki/OpenGeoDB) and converts them into a JSON format more suitable to the project.
Only the used fields are imported, and the "lat" and "lon" fields are converted to a [GeoJSON](https://geojson.org/) point object.

### Usage

Use `deno run -A GeoDbJson/main.ts` to run the script, or download a compiled binary and run it. The resulting JSON document will appear in the current working directory.

### Download

You can also download the JSON document directly from [releases](https://github.com/TransDB-de/Tools/releases/download/0.1.2/GeoDbJson.zip).
