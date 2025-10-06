const fs = require("fs");
// const { parse } = require("csv-parse");

module.exports =  getJSON = (csv_file) =>{
    return new Promise((resolve,reject)=>{ 
    let jsonArray = [];
    fs.createReadStream(csv_file)
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
      jsonArray.push(row)
    })
    .on("end", function () {
      let index = jsonArray.length-1 
      console.log('Data has been fetched from .csv file!')
      resolve(jsonArray[index]) 
    })
    .on("error", function (error) {
        reject('No Matches has been found!')
      })
    })
}