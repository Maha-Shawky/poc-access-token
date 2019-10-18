const callsWriter = require('./src/Utils/callsWriter')
const FaceBookAPI = require('./src/FaceBookAPI');
const { TokenManager, CallType } = require('./src/TokenManager');
const accessTokens = require('./accessTokens.json');

/**
 * {
  "error": {
    "message": "(#4) Application request limit reached",
    "type": "OAuthException",
    "is_transient": true,
    "code": 4,
    "fbtrace_id": "Ab62z_9wKQFgamX69q96Wno"
  }
}
* - Bad request => expire
* - Forbidden => rate limit call count, total count,
*/

const tokenManager = new TokenManager();
const fbApi = new FaceBookAPI({ tokenManager })
const fastCallUrl = 'https://graph.facebook.com/v4.0/me?fields=id,name&';
const slowCallUrl = 'https://graph.facebook.com/v4.0/me/feed?limit=100&';

setUp = async() => {

    for (i = 0; i < accessTokens.length; i++) {
        const accToken = accessTokens[i];
        const token = await fbApi.callByAccessToken(fastCallUrl, accToken)

        const { accessToken, ...props } = token;
        console.log(JSON.stringify(props));
    }
}

checkIfLimitedTokenReleased = async() => {

    const rateLimited = tokenManager.getTokenByStatusCode(403, 1);

    for (i = 0; i < rateLimited.length; i++) {

        const accToken = rateLimited[i].accessToken;
        const token = await fbApi.callByAccessToken(fastCallUrl, accToken);

        if (token.code === 200)
            console.log(`Token is released and could be reused: ${JSON.stringify(token)}`)
    }
}

continuosCallFBookAndLog = async(url, fileName, saveDataInFile) => {
    try {
        let token = {}
        do {

            token = await fbApi.call(url);
            const { accessToken, ...props } = token;
            console.log(JSON.stringify(props));

            if (saveDataInFile)
                await callsWriter.appendToJsonFile(fileName, token);

        } while (token.code === 200);
    } catch (e) {
        console.log(e);
    }
}

(async() => {
    console.log('Make sure to create accessTokens.json file as accessTokens-Example.json');

    console.log('Pull given tokens usage #############');
    await setUp();

    console.log('Check if rate limited token released #############');
    await checkIfLimitedTokenReleased();

    console.log('Start crawling #############');
    await continuosCallFBookAndLog(slowCallUrl, 'results.json', false);

})()