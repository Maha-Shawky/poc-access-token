const https = require('https');

class FaceBookAPI {
    constructor(deps) {
        this.tokenManager = deps.tokenManager;
    }

    // Call api by selecting the lowest consumption type
    call(url, consumptionType) {

        const token = this.tokenManager.findLowerConsumedToken(consumptionType);
        if (!token)
            Promise.reject('No available tokens');

        return this.callByAccessToken(url, token.accessToken, consumptionType);
    }

    callByAccessToken(url, accessToken, consumptionType) {

        return new Promise((resolve, reject) => {

            https.get(`${url}${accessToken}`, (res) => {

                const usage = JSON.parse(res.headers['x-app-usage']);
                const tokenInfo = {
                    call_count: usage.call_count,
                    total_cputime: usage.total_cputime,
                    total_time: usage.total_time,
                    code: res.statusCode,
                    lastUpdated: new Date()
                }

                this.tokenManager.upsertToken(accessToken, tokenInfo);
                resolve(tokenInfo);
            })
        })
    }
}

module.exports = FaceBookAPI;