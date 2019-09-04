const functionObj = require('./subwayFindr')

const roundDistance = functionObj.roundDistance
const createStarterResults = functionObj.createStarterResults
const programData = functionObj.programData
const distance = functionObj.distance
const addResult = functionObj.addResult
const checkDuplicateStations = functionObj.checkDuplicateStations
const splitter = functionObj.splitter
const calculateSingleDistance = functionObj.calculateSingleDistance
const convertFloat = functionObj.convertFloat
const roundCoordinates = functionObj.roundCoordinates
const processResults = functionObj.processResults
const messageCreator = functionObj.messageCreator
const processSubwayData = functionObj.processSubwayData
const findTopFiveClosestStations = functionObj.findTopFiveClosestStations
const fetchSubwayData = functionObj.fetchSubwayData

const dummyMidProgramResults = [
    { distance: 6.97135483644314, name: "Melrose Ave & 149th St at NW corner", line: "2-5" },
    { distance: 6.982724022303106, name: "3rd Ave & 149th St at NW corner", line: "2-5" },
    { distance: 7.279052294639449, name: "Jackson Ave & 152nd St at NE corner", line: "2-5" },
    { distance: 7.301600221174902, name: "Jackson Ave & Westchester Ave at NE corner", line: "2-5" },
    { distance: 7.657604820322014, name: "Westchester & 160th St at SW corner", line: "2-5" }
]

const dummyFinalResults = [
    { distance: 0.20797624418019964, name: "Broadway & 14th St at SW corner", line: "L-N-Q-R-4-5-6" },
    { distance: 0.24864387223718928, name: "6th Ave & 14th St at SE corner", line: "F-L-M-1-2-3" },
    { distance: 0.24966626912479772, name: "Broadway & 8th Ave at SW corner", line: "N-R" },
    { distance: 0.26433756739196634, name: "6th Ave & Waverly Pl at NE corner", line: "A-B-C-D-E-F-M" },
    { distance: 0.2768989973665601, name: "Broadway & 16th St at SE corner", line: "L-N-Q-R-4-5-6" }
]

const dummyCorrectFinalArray = [
    "The L-N-Q-R-4-5-6, 0.21 miles away at Broadway & 14th St at SW corner",
    "The F-L-M-1-2-3, 0.25 miles away at 6th Ave & 14th St at SE corner",
    "The N-R, 0.25 miles away at Broadway & 8th Ave at SW corner",
    "The A-B-C-D-E-F-M, 0.26 miles away at 6th Ave & Waverly Pl at NE corner",
    "The L-N-Q-R-4-5-6, 0.28 miles away at Broadway & 16th St at SE corner"
]


//Unit tests:

test('distance is rounded to the correct value', () => {
    let distance = 3.5647873894
    expect(roundDistance(distance)).toEqual(3.56);
});

test('results array starts off correctly for later functionality', ()=>{
    let expectedResult = [
        {
            distance: 1000,
            name: 'Dummy station at SW Entrance',
            line: "Dummy Line"
        }, 
        {
            distance: 1000,
            name: 'Dummy station at SW Entrance',
            line: "Dummy Line"
        }, 
        {
            distance: 1000,
            name: 'Dummy station at SW Entrance',
            line: "Dummy Line"
        }, 
        {
            distance: 1000,
            name: 'Dummy station at SW Entrance',
            line: "Dummy Line"
        }, 
        {
            distance: 1000,
            name: 'Dummy station at SW Entrance',
            line: "Dummy Line"
        }
    ]
    expect(createStarterResults()).toEqual(expectedResult)
})

test('program starts with correct data', () => {
    let expectedObj = programData

    expect(expectedObj.nycDataUrl).toEqual('https://data.cityofnewyork.us/resource/he7q-3hwy.json')
    expect(expectedObj.distanceUnit).toEqual('M')
    expect(expectedObj.results).toEqual(createStarterResults())
})

test('distance algorithm works when given identical coordinates', () => {
    let lat1 = 40.733933122168175
    let lat2 = 40.733933122168175
    let long1 = -73.99482177570462
    let long2 = -73.99482177570462

    expect(distance(lat1, long1, lat2, long2)).toEqual(0)
})

test('distance algorithm works when given different coordinates', ()=>{
    let lat1 = 40.733933122168175
    let lat2 = 41.733933122168175
    let long1 = -73.99482177570462
    let long2 = -74.99482177570462

    expect(distance(lat1, long1, lat2, long2)).toEqual(86.4450210935919)
})

test('add result algorithm correctly qualifies and disqualifies results in the top five', ()=>{

    let newObj = { distance: 6.925340900488399, name: "Adam C. Powell Blvd & 149th St at NE corner", line: "3" }

    let expectedNewResults = [
        newObj, 
        { distance: 6.97135483644314, name: "Melrose Ave & 149th St at NW corner", line: "2-5" },
        { distance: 6.982724022303106, name: "3rd Ave & 149th St at NW corner", line: "2-5" },
        { distance: 7.279052294639449, name: "Jackson Ave & 152nd St at NE corner", line: "2-5" },
        { distance: 7.301600221174902, name: "Jackson Ave & Westchester Ave at NE corner", line: "2-5" },
    ]

    expect(addResult(newObj, dummyMidProgramResults)).toEqual(expectedNewResults)
})

test('splitter correctly parses the strong', ()=>{
    let name = "Melrose Ave & 149th St at NW corner"
    expect(splitter(name)).toEqual("Melrose Ave & 149th St")
})

test('checkDuplicateStations returns true if there is a qualifying duplicate', ()=>{
    let newStation = { distance: 6.97135483644314, name: "Melrose Ave & 149th St at NW corner", line: "2-5" }
    
    expect(checkDuplicateStations(dummyMidProgramResults, newStation)).toEqual(true)
})

test('checkDuplicateStations returns false if there is are no qualifying duplicate', ()=>{
    let newStation = { distance: 6.97135483644314, name: "4th Ave at NW corner", line: "2-5" }

    expect(checkDuplicateStations(dummyMidProgramResults, newStation)).toEqual(false)
})

test('calculateSingDistance correctly returns distance with json data of single station', ()=>{
    let station = { 
                        objectid: "1734", 
                        url: "http://web.mta.info/nyct/service/", 
                        name: "Birchall Ave & Sagamore St at NW corner", 
                        the_geom: {
                            coordinates: [-73.86835600032798, 40.84916900104506],
                            type: "Point"
                        }, 
                        line: "2-5" 
                    }

    let originLat = 40.733933122168175
    let originLong = -73.99482177570462

    expect(calculateSingleDistance(station, originLat, originLong)).toEqual(10.351199669870347)
})

test('convertFloat correctly converts float to number needed for comparison', ()=>{
    let float = -73.99482177570462

    expect(convertFloat(float)).toEqual(-7399482177570463000)
})


test('roundCoordinates correctly rounds long coordinates to four decimal places', ()=>{
    let coordinate = 40.733933122168175

    expect(roundCoordinates(coordinate)).toEqual(40.7339)
})

test('processResults gives the correct array of strings for the user', ()=>{

    expect(processResults(dummyFinalResults)).toEqual(dummyCorrectFinalArray)
})

test('message creator writes the correct string for a station result', ()=>{
    let result = { distance: 0.20797624418019964, name: "Broadway & 14th St at SW corner", line: "L-N-Q-R-4-5-6" }
    let roundedDistance = roundDistance(result.distance)

    expect(messageCreator(result, roundedDistance)).toEqual("The L-N-Q-R-4-5-6, 0.21 miles away at Broadway & 14th St at SW corner")
})

//Integration tests:

test('processSubwayData correctly calls the other necessary/tested functions', ()=>{
    let originLat = 40.733933122168175
    let originLong = -73.99482177570462

    let stations = [
        {
            objectid: "1734",
            url: "http://web.mta.info/nyct/service/",
            name: "Birchall Ave & Sagamore St at NW corner",
            the_geom: {
                coordinates: [-73.86835600032798, 40.84916900104506],
                type: "Point"
            },
            line: "2-5"
        }
    ]

    let expectedResult = ["The 2-5, 10.35 miles away at Birchall Ave & Sagamore St at NW corner", "The Dummy Line, 1000 miles away at Dummy station at SW Entrance", "The Dummy Line, 1000 miles away at Dummy station at SW Entrance", "The Dummy Line, 1000 miles away at Dummy station at SW Entrance", "The Dummy Line, 1000 miles away at Dummy station at SW Entrance"]

    expect(processSubwayData(stations, originLat, originLong)).toEqual(expectedResult)
    
})

//full integration of api call and resultant data after processing (as tested above)
describe('nyc data api call', () => {
    let originLat = 40.733933122168175
    let originLong = -73.99482177570462

    it('calls the api and is integrated with the rest of the program to return the correct result', () => {
 
        fetchSubwayData(originLat, originLong).then(res => {

            expect(res).toEqual(["The L-N-Q-R-4-5-6, 0.21 miles away at Broadway & 14th St at SW corner", "The F-L-M-1-2-3, 0.25 miles away at 6th Ave & 14th St at SE corner", "The N-R, 0.25 miles away at Broadway & 8th Ave at SW corner", "The A-B-C-D-E-F-M, 0.26 miles away at 6th Ave & Waverly Pl at NE corner", "The L-N-Q-R-4-5-6, 0.28 miles away at Broadway & 16th St at SE corner"])
        })
    })
})


