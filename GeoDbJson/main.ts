import { readerFromStreamReader } from "https://deno.land/std@0.83.0/io/streams.ts"
import * as csv from "https://deno.land/std@0.83.0/encoding/csv.ts"
import dirname from "https://deno.land/x/denoname/mod/dirname.ts"


// Script Settings

const outName = "data.json"; // how the resulting file should be named
const url = "http://www.fa-technik.adfc.de/code/opengeodb/DE.tab"; // where to download the csv from
const minLevel = 6; // the minimum level to include


// Useful Constants

const dir = dirname(import.meta);
const decoder = new TextDecoder();
const encoder = new TextEncoder();


// Download Data

console.log("Downloading latest 'DE.tab' file from opengeodb");
console.time("Ellapsed time");


let res = await fetch(url)
let reader = readerFromStreamReader(res.body!.getReader())

let data = await Deno.readAll(reader);


// Parse Data as Array

console.log("Parsing csv to array");

let string = decoder.decode(data);

let arr = await csv.parse( string, {
	separator: "\t",
	lazyQuotes: true
}) as string[][];


// Convert and Filter Data to required Format

console.log("Converting array to objects");

interface GeoJsonPoint {
	type: "Point",
	coordinates: [number, number]
}

interface Doc {
	name: string,
	ascii: string,
	plz: string,
	location: GeoJsonPoint
}

let docArr: Doc[] = [];

// get numerical indexes from first line in csv array
const index = {
	name: arr[0].indexOf("name"),
	ascii: arr[0].indexOf("ascii"),
	plz: arr[0].indexOf("plz"),
	lat: arr[0].indexOf("lat"),
	lon: arr[0].indexOf("lon"),
	level: arr[0].indexOf("level")
}

// convert arrays to objects
for (let i = 1; i < arr.length; i++) {
	const entry = arr[i];

	let level = parseInt( entry[index.name] );

	if (level < minLevel) continue;

	let lat = parseFloat( entry[index.lat] );
	let lon = parseFloat( entry[index.lon] );

	let loc: GeoJsonPoint = {
		type: "Point",
		coordinates: [ lat, lon ]
	}

	let doc: Doc = {
		name: entry[ index.name ],
		ascii: entry[ index.ascii ],
		plz: entry[ index.plz ],
		location: loc
	};

	docArr.push(doc);
}

console.log("Stringifying to JSON");

data = encoder.encode(
	JSON.stringify(docArr)
);

console.log(`Writing file to local folder as '${outName}'`);

await Deno.writeFile(dir + "data.json", data);

console.log("Done!");
console.timeEnd("Ellapsed time");