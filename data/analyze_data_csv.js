var csv = require('fast-csv');
var fs = require('fs');
var path = require('path');
var concat = require('concat-stream');
var unzip = require('unzip');

var file = path.join(__dirname, 'form_460_schedule_A_geo_enriched.csv');

var counties = {}, x = 0;
var states = {};

var processFile = function (d) {
  counties[d.county] = counties[d.county] || {name: d.county, count: 0, amount1: 0, amount2: 0};
  counties[d.county].count++;
  counties[d.county].amount1 += parseInt(d.Tran_Amt1.slice(1), 10) ? parseInt(d.Tran_Amt1.slice(1), 10) : 0;
  counties[d.county].amount2 += parseInt(d.Tran_Amt2.slice(1), 10) ? parseInt(d.Tran_Amt2.slice(1), 10) : 0;
  states[d.state] = states[d.state] || {name: d.state, count: 0, amount1: 0, amount2: 0};
  states[d.state].count++;
  states[d.state].amount1 += parseInt(d.Tran_Amt1.slice(1), 10) ? parseInt(d.Tran_Amt1.slice(1), 10) : 0;
  states[d.state].amount2 += parseInt(d.Tran_Amt2.slice(1), 10) ? parseInt(d.Tran_Amt2.slice(1), 10) : 0;
  if (x > 10) return;
  x++;
};

fs.createReadStream(file)
  .pipe(csv({headers: true}))
  .on('data', processFile)
  .on('finish', function () {
    var countiesList = Object.keys(counties).map(function (key) { return counties[key]; });
    countiesList.sort(function (a, b) { return a.count < b.count ? 1: a.count == b.count ? 0 : -1; });
    var i = 0;
    for (; i < 30; i++) {
      console.log(countiesList[i].name, countiesList[i].count, countiesList[i].amount1, countiesList[i].amount2);
    }
    var statesList = Object.keys(states).map(function (key) { return states[key]; });
    statesList.sort(function (a, b) { return a.count < b.count ? 1: a.count == b.count ? 0 : -1; });
    var i = 0;
    for (; i < 30; i++) {
      console.log(statesList[i].name, statesList[i].count, statesList[i].amount1, statesList[i].amount2);
    }
  });



// electric imp -- hardward gets an ip address -- blinkup to get SSID onto chip
// spark -- only wireless N

// getiota.com
