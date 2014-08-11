var unzip = require('unzip');
var fs = require('graceful-fs');
var async = require('async');
var path = require('path');
var xls = require('xlsx');
var zip = require('adm-zip');
var concat = require('concat-stream');
var csv = require('csv');

var directory = __dirname;
fs.readdir(directory, function (err, files) {
  var concatenated = '';
  console.log(files);
  files.forEach(function (file) {
    if (file.match('Contributions.zip$') && !fs.lstatSync(file).isDirectory()) {
      fs.createReadStream(file)
        .pipe(unzip.Parse())
        .on('entry', function (entry) {          
          entry.pipe(concat(function (spreadsheet) {
            console.log(file);
            var workbook = xls.read(spreadsheet, {type: 'buffer'});
            workbook.SheetNames.forEach(function(y) {
              var worksheet = workbook.Sheets[y];
              for (var z in worksheet) {
                console.log(y + "!" + z + "=" + JSON.stringify(worksheet[z].v));
              }
            });
          }));
        });
    }
  });
});
