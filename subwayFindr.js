
const fetch = require('node-fetch')

//starter data helpful for program
const programData = (function () {
    return {
        nycDataUrl: 'https://data.cityofnewyork.us/resource/he7q-3hwy.json',
        distanceUnit: 'M',
        results: createStarterResults()
    }
})()

//round the coordinates down for some perhaps overly-precise input
function roundCoordinates(num) {
    return Math.round(num * 10000) / 10000
}

//function to create some starter dummy results for my distance bubbling algorithm (f addResult)
function createStarterResults() {
    let array = []
    for (let i = 0; i < 5; i++) {
        array.push({
            distance: 1000,
            name: 'Dummy station at SW Entrance',
            line: "Dummy Line"
        })
    }
    return array
}

//below function (f distance) is not my own work, sourced here:
//https://www.geodatasource.com/developers/javascript
function distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") { dist = dist * 1.609344 }
        if (unit == "N") { dist = dist * 0.8684 }

        return dist;
    }
}

//function to retrieve the subway data as json
function fetchSubwayData(originLat, originLong) {
    return fetch(programData.nycDataUrl)
        .then(res => res.json())
        .then(json => processSubwayData(json, originLat, originLong))
        .catch((err) => {
            console.warn('1', err)
            return err
        })
}

//function to create result objects and process them for if they make the top five
function processSubwayData(subwayStations, originLat, originLong) {
    for (let station of subwayStations) {
        let resultObject = {
            distance: calculateSingleDistance(station, originLat, originLong),
            name: (() => station.name ? station.name : "Unnamed Station at Corner")(),
            line: station.line
        }
        programData.results = addResult(resultObject, programData.results)
    }

    return processResults(programData.results)
}

//function to process results and return an array of readable result messages
function processResults(programResults) {
    let resultsArray = []
    for (let result of programResults) {
        let roundedDistance = roundDistance(result.distance)
        let message = messageCreator(result, roundedDistance)
        resultsArray.push(message)
    }
    // console.log(resultsArray)
    return resultsArray
}

function messageCreator(result, roundedDistance){
    return `The ${result.line}, ${roundedDistance} miles away at ${result.name}`
}

//function to round the distance to more readable format
function roundDistance(distance) {
    return Math.round(distance * 100) / 100
}

//function to bubble through result to maintain top five as I loop once through the subway station json data and not have to sort later
function addResult(resultObject, currentResults) {
    let results = currentResults

    if (!checkDuplicateStations(results, resultObject)) {
        results.unshift(resultObject)
        for (let i = 0; i < 5; i++) {
            let floatOne = convertFloat(results[i].distance)
            let floatTwo = convertFloat(results[i + 1].distance)
            if (floatOne > floatTwo) {
                let temp = results[i + 1]
                results[i + 1] = results[i]
                results[i] = temp
            }
        }

    }
    return results.slice(0, 5)
}

//function to convert the distances into a javascript comparable format
function convertFloat(float) {
    return Math.round(parseFloat(float) * Math.pow(10, 17))
}


function splitter(name){
    return name.split(' at ')[0]
}

//function to take care of the fact that the subway station json has multiple entrance objects for the same station/line stop
function checkDuplicateStations(results, station) {
    return results.some(result => splitter(result.name) === splitter(station.name))
}

//function to grab the actual distance for a particular station
function calculateSingleDistance(station, originLat, originLong) {
    let points = station.the_geom.coordinates.reverse()

    let lat1 = originLat
    let lon1 = originLong
    let lat2 = points[0]
    let lon2 = points[1]

    return distance(lat1, lon1, lat2, lon2, programData.unit)
}

//master function to be invoked to return the actual top-five stations data asked for
function findTopFiveClosestStations(lat, long) {
    lat = roundCoordinates(lat)
    long = roundCoordinates(long)

    return fetchSubwayData(lat, long)
}

//main function invoked here
findTopFiveClosestStations(40.733933122168175, -73.99482177570462)

module.exports = {
    roundDistance: roundDistance,
    programData: programData,
    createStarterResults: createStarterResults, 
    distance: distance,
    addResult: addResult,
    splitter: splitter, 
    checkDuplicateStations: checkDuplicateStations,
    calculateSingleDistance: calculateSingleDistance,
    convertFloat: convertFloat,
    roundCoordinates: roundCoordinates,
    processResults: processResults,
    messageCreator: messageCreator,
    processSubwayData: processSubwayData,
    findTopFiveClosestStations: findTopFiveClosestStations,
    fetchSubwayData: fetchSubwayData
}