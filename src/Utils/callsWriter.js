const fs = require('fs')

module.exports = {
    appendToJsonFile: (fileName, jsonObj) => {

        return new Promise((resolve, reject) => {

            fs.readFile(fileName, function(err, data) {
                if (err)
                    reject(err);

                var json = JSON.parse(data)
                json.push(jsonObj)

                fs.writeFile(fileName, JSON.stringify(json, null, 4), (err, data) => {
                    if (err)
                        return reject(err);

                    resolve(data);
                })
            })
        })
    },

    setDurationForEachCall: async(fileName) => {
        return new Promise((resolve, reject) => {
            fs.readFile(fileName, function(err, data) {
                if (err)
                    reject(err);

                var jsonArray = JSON.parse(data)
                let totalDuration = 0;

                jsonArray = jsonArray.map((obj, i) => {
                    if (i === 0)
                        return obj;

                    const diffTime = Math.abs(new Date(obj.date) - new Date(jsonArray[i - 1].date));
                    const diffSec = Math.round(diffTime / (1000));

                    if (obj.code === 'OK') totalDuration += diffSec;

                    return {...obj, durationInSec: diffSec };
                })
                fs.writeFile(fileName, JSON.stringify(jsonArray, null, 4), (err, data) => {
                    if (err)
                        reject(err);

                    resolve(totalDuration);
                })
            })
        })
    },

    testLogToFile: async(fileName) => {
        const data = {
            call_count: 10,
            total_cputime: 20,
            total_time: 30,
            code: 200,
            date: new Date().toISOString()
        }

        for (i = 0; i < 10; i++) {
            await this.appendToJsonFile(fileName, data);
        }
    }
}