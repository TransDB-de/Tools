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


let res = await fetch(url);
let reader = readerFromStreamReader(res.body!.getReader());

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
	level?: number,
	loc_id?: string,
	name: string,
	ascii?: string,
	plz: string,
	location: GeoJsonPoint | null,
	of?: string,
	referenceLocation?: GeoJsonPoint
}

let docArr: Doc[] = [];

// get numerical indexes from first line in csv array
const index = {
	loc_id: arr[0].indexOf("#loc_id"),
	name: arr[0].indexOf("name"),
	ascii: arr[0].indexOf("ascii"),
	plz: arr[0].indexOf("plz"),
	lat: arr[0].indexOf("lat"),
	lon: arr[0].indexOf("lon"),
	level: arr[0].indexOf("level"),
	of: arr[0].indexOf("of")
}

// convert nested arrays to objects
for (let i = 1; i < arr.length; i++) {
	const entry = arr[i];

	let level = parseInt( entry[index.level] );

	let lat = parseFloat( entry[index.lat] );
	let lon = parseFloat( entry[index.lon] );

	let loc: GeoJsonPoint | null = null;

	// if lat and lon are present, convert to location
	if (lat && lon) {

		loc = {
			type: "Point",
			coordinates: [ lat, lon ]
		}

	}

	let doc: Doc = {
		level: level,
		loc_id: entry[ index.loc_id ],
		name: entry[ index.name ],
		ascii: entry[ index.ascii ],
		plz: entry[ index.plz ],
		location: loc,
		of: entry[ index.of ]
	};

	docArr.push(doc);
}

const embedReferenceLocation = (doc: Doc, refID: string) => {

	// Loop to recursivly get referenced location, until it is found, or no further references are found
	while ( !doc.location && !doc.referenceLocation ) {

		// search for referenced document
		let refDoc = docArr.find(d => d.loc_id === doc.of);

		// no reference found
		if (!refDoc) break;

		if (refDoc.location) {

			// fill location from reference
			doc.referenceLocation = {
				type: "Point",
				coordinates: [
					refDoc.location.coordinates[0],
					refDoc.location.coordinates[1]
				]
			}

		}

		// no further reference linked
		if (!refDoc.of) break;

		// set reference to next reference
		doc.of = refDoc.of;

	}

}

// If there are referenced docs, extract their location. Not all entries have locations
for (let i = 0; i < docArr.length; i++) {
	const doc = docArr[i];

	let refId = doc.of;

	if (refId) {
		embedReferenceLocation(doc, refId);
	}
}

let finalDocs: Doc[] = [];

// remove temp fields, and filter unwanted docs
for (let i = 0; i < docArr.length; i++) {
	const doc = docArr[i];

	// level too low
	if (doc.level && doc.level < minLevel) continue;

	// no name present
	if (!doc.name) continue;

	delete doc.loc_id;
	delete doc.of;

	finalDocs.push(doc);
}

console.log("Stringifying to JSON");

data = encoder.encode(
	JSON.stringify(finalDocs)
);

console.log(`Writing file to local folder as '${outName}'`);

await Deno.writeFile(dir + "data.json", data);

console.log("Done!");
console.timeEnd("Ellapsed time");
