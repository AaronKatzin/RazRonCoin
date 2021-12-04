const fs = require('fs');
const {
    Transaction
} = require('.\\BC_Part_4_1 - Full\\Blockchain4.js');

function saveListToFile(list, file){
    // console.log("received list to save: ", list);
    const jsonified = JSON.stringify(list);
    try {
        fs.writeFileSync(file, jsonified);
        // console.log("JSON data is saved to file:\n", jsonified);
    } catch (error) {
        console.error("Failed to save list due to: ", err);
    }
    /*for(var obj in list){
        const jsonified = JSON.stringify(list[obj]);
        console.log("converting to JSON: ", list[obj]); 
        try {
            fs.writeFileSync(file, jsonified);
            console.log("JSON data is saved to file:\n", jsonified);
        } catch (error) {
            console.error(err);
        }
    }*/
}

function loadFileToList(file){
    // load JSON Object list
    const objectList = JSON.parse(fs.readFileSync(file));
    const txList = [];
    //convert to strongly-typed transactions 
    for(obj in objectList){
        txList.push(Transaction.class(objectList[obj]));
    }
    return txList;
}
module.exports = {saveListToFile, loadFileToList};
