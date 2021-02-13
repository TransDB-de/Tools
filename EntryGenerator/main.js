#!/usr/bin/env node
import { ArgumentParser } from "argparse";
import * as fs from "fs";
import faker from "faker";

// Parse command line arguments
const parser = new ArgumentParser({ add_help: true });

parser.add_argument("-c", "--count", { help: "Number of random generated entries", type: "int", required: true });
parser.add_argument("-f", "--format", { help: "Format entries in file with indent", required: false, default: false, const: true, nargs: "?" });
parser.add_argument("-a", "--approved", { help: "Percentage of approved entries", type: "int", required: false, default: 0  });

const args = parser.parse_args();

// Force approved to be within 0 and 100
args.approved = args.approved < 0 ? 0 : args.approved > 100 ? 100 : args.approved;

console.log(`- Generator settings -\nEntries: ${args.count}\nApproved rate: ${args.approved}%\nFormatted JSON: ${args.format}\n`);

// Configure faker
faker.locale = "de";

// Generate entries
let entries = [];

console.log("Generating entries...");

for(let i = 0; i < args.count; i++) {

    let type = faker.helpers.randomize(["group", "therapist", "surveyor", "endocrinologist", "surgeon", "logopedics", "hairremoval"])

    let name = faker.company.companyName();
    let firstName = faker.random.boolean() ? faker.name.firstName() : null;
    let lastName = faker.random.boolean() ? faker.name.lastName() : null;

    let email = faker.internet.email();
    let website = faker.random.boolean() ? faker.internet.url() : null;
    let telephone = faker.random.boolean() ? faker.phone.phoneNumber() : null;

    let address = {
        city: faker.address.city(),
        plz: faker.address.zipCode(),
        street: faker.address.streetName(),
        house: faker.random.number({ min: 1, max: 200 })
    }

    let location = {
        type: "Point",
        coordinates: [parseFloat(faker.address.longitude()), parseFloat(faker.address.latitude())]
    }

    let meta = {
        attributes: null, specials: null, minAge: null, subject: null, offers: null
    }

    switch (type) {

        case "group":
            meta.attributes = faker.random.arrayElements(["trans", "regularMeetings", "consulting", "activities"]);
            meta.specials = faker.random.boolean() ? faker.random.words() : null;
            meta.minAge = faker.random.boolean() ? faker.random.number({ min: 14, max: 30 }) : null;
            break;

        case "therapist":
            meta.subject = faker.helpers.randomize(["therapist", "psychologist"]);
            meta.offers = faker.random.arrayElements(["indication", "therapy"]);
            break;

        case "surveyor":
            meta.attributes = faker.random.boolean() ? faker.random.arrayElements(["enby"]) : null;
            break;

        case "surgeon":
            meta.offers = faker.random.arrayElements(
                ["mastectomy", "vaginPI", "vaginCombined", "ffs", "penoid", "breast", "hyst", "orch", "clitPI", "bodyfem"],
                faker.random.number({ min: 1, max: 5 })
            );
            break;

        case "hairremoval":
            meta.attributes = faker.random.arrayElements(["insurancePay", "transfrendly", "hasDoctor"]);
            meta.offers = faker.random.arrayElements(["laser", "ipl", "electro", "electroAE"]);
            break;

    }

    let approved = false;

    if(args.approved) {
        let rand = faker.random.number({ min: 0, max: 100 });
        approved = rand <= args.approved;
    }

    let submittedTimestamp = Date.now();

    entries.push({
        type, approved, name, firstName, lastName, email, website, telephone, address, meta, location, submittedTimestamp
    });

}

console.log("Entries generated and saved into entries.json");

let json = null;

if(args.format) {
    json = JSON.stringify(entries, null, 4);
} else {
    json = JSON.stringify(entries);
}

fs.writeFileSync("entries.json", json);