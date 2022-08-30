import fs from "fs";
import path from "path";
import zeromq from "zeromq";
import neatCsv from "neat-csv";

function readVehicleLocations() {
    console.log(`path.resolve(): ${path.resolve()}`);
    const fileLocation = path.resolve("assets/vehicle_locations.csv");
    const vehicleLocationsInCSV = fs.readFileSync(fileLocation).toString();
    return neatCsv(vehicleLocationsInCSV);
}

async function runServer() {
    const socket = zeromq.socket("pub");
    socket.bindSync("tcp://127.0.0.1:5010");
    console.log("Publisher bound to port 5010");

    console.log("Getting vehicle locations...");
    const vehicleLocations = await readVehicleLocations();

    let vehicleLocationIndex = 0;

    const intervalID = setInterval(function () {
        console.log("Sending vehicle location...");
        const vehicleLocation = vehicleLocations[vehicleLocationIndex];
        socket.send(["vehicle_locations", vehicleLocation]);

        if (vehicleLocationIndex === (vehicleLocations.length - 1)) {
            clearInterval(intervalID);
        }

        vehicleLocationIndex++;
    }, 1000);
}

runServer();