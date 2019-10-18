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

continuosCallFBookAndLog = async(url, fileName, writeInfile) => {

    while (true) {
        try {
            const token = await fbApi.call(url);
            const { accessToken, ...props } = token;
            console.log(JSON.stringify(props));

            if (writeInfile)
                await callsWriter.appendToJsonFile(fileName, token);

        } catch (e) {
            console.log(e);
        }
    }
}

setUp = async() => {

    for (i = 0; i < accessTokens.length; i++) {
        const accToken = accessTokens[i];
        const token = await fbApi.callByAccessToken('https://graph.facebook.com/v4.0/me?fields=id,name&', accToken)

        const { accessToken, ...props } = token;
        console.log(JSON.stringify(props));
    }
}

(async() => {
    console.log('Make sure to create accessTokens.json file as accessTokens-Example.json');

    console.log('Setup tokens #############');
    await setUp();

    console.log('Start crawling #############');
    const url = `https://graph.facebook.com/v4.0/me/feed?limit=100&`;
    await continuosCallFBookAndLog(url, 'results.json', false)

})()