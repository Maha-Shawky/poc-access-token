const https = require('https');

class FaceBookAPI {
    constructor(deps) {
        this.tokenManager = deps.tokenManager;
    }

    call(url, consumptionType) {

        return new Promise((resolve, reject) => {

            const token = this.tokenManager.findLowerConsumedToken(consumptionType);
            if (!token)
                reject('No available tokens');

            https.get(`${url}${token.accessToken}`, (res) => {
                const usage = res.headers['x-app-usage'];
                const tokenInfo = {
                    call_count: usage.call_count,
                    total_cputime: usage.total_cputime,
                    total_time: usage.total_time,
                    code: 200
                }

                resolve(tokenInfo);
            })
        })
    }
}

module.exports = FaceBookAPI;