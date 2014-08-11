var csv = require('fast-csv');
var unzip = require('unzip');
var fs = require('fs');
var path = require('path');
var geo = require('geojson-utils');
var concat = require('concat-stream');
var geojsonStream = require('geojson-stream');

var archive = path.join(__dirname, 'Campaign_Finance_-_UNREDACTED_-_FPPC_Form_460_-_Schedule_A_-_Monetary_Contributions.zip');
//var districts = require(path.join(__dirname, 'geo/districts.geojson'));
var districtsJSON = fs.readFileSync(path.join(__dirname, 'geo/districts.geojson'));
var districts = JSON.parse(districtsJSON);
// var states = require(path.join(__dirname, 'geo/states.geojson'));
var statesJSON = fs.readFileSync(path.join(__dirname, 'geo/states.geojson'));
var states = JSON.parse(statesJSON);
//var censusTracts = require(path.join(__dirname, 'geo/censusTracts.geojson'));
var censusTractsJSON = fs.readFileSync(path.join(__dirname, 'geo/censusTracts.geojson'));
var censusTracts = JSON.parse(censusTractsJSON);

var countiesJSON = fs.readFileSync(path.join(__dirname, 'geo/counties.geojson'));
var counties = JSON.parse(countiesJSON);

var csvStream = csv.createWriteStream({headers: true}),
   writableStream = fs.createWriteStream(path.join(__dirname, 'form_460_schedule_A_geo_enriched.csv'));

csvStream.pipe(writableStream);

var checkpoint = 0;

var zipRegex = /\d{5}(-\d{4})?\s*$/;

var processFile = function (d) {
  process.stdout.write(checkpoint + '\r');
  checkpoint++;
  var lat, long, addr;
  var tmp = d.Tran_Location.split('(');
  addr = tmp[0];
  if (!tmp[1]) return;
  lat  = tmp[1].split(',')[0].trim();
  if (!tmp[1].split(',')[1]) return;
  long = tmp[1].split(',')[1].slice(0, -1).trim();
  // console.log(addr + ' | ' + lat + ' | ' + long);
  // if (checkpoint > 10) return;
  var i, district, state, censusTract, county;
  d.lat = lat || '';
  d.long = long || '';
  d.zip = !!addr.match(zipRegex) ? addr.match(zipRegex)[0].trim() : '';
  d.district = '';
  d.state = 'CA';
  d.Census_Tract = '';
  d.county = '';

  for (i = 0; i < districts.features.length; i++) {
    district = districts.features[i];
    if (geo.pointInPolygon({type:'Point', coordinates: [long, lat]}, district.geometry)) {
      // console.log(lat, long, JSON.stringify(district.geometry.coordinates[0][0]));
      d.district = district.properties.DISTRICT;
      break;
    }
  };
  if (d.district === '') {
    for (i = 0; i < states.features.length; i++) {
      state = states.features[i];
      if (geo.pointInPolygon({type:'Point', coordinates: [long, lat]}, state.geometry)) {
        d.state = state.properties.STATE;
        break;
      }
    };
  }
  if (d.state !== 'CA') { csvStream.write(d); return; }
  for (i = 0; i < censusTracts.features.length; i++) {
    censusTract = censusTracts.features[i];
    if (geo.pointInPolygon({type:'Point', coordinates: [long, lat]}, censusTract.geometry)) {
      d.Census_Tract = censusTract.properties.BLOCKCE10;
      break;
    }
  };
  for (i = 0; i < counties.features.length; i++) {
    county = counties.features[i];
    if (geo.pointInPolygon({type:'Point', coordinates: [long, lat]}, county.geometry)) {
      d.county = county.properties.NAME;
      break;
    }
  };
  csvStream.write(d);
};

fs.createReadStream(archive)
///csv.fromStream(
  .pipe(unzip.Parse())
  .on('entry', function (entry) {
    entry.pipe(csv({headers: true}))
      .on('data', processFile);
  })
  .on('error', function (err) { console.log(err); })
  .on('finish', function () {
    csvStream.write(null);
  });

