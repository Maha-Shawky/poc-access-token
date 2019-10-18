const callsWriter = require('./src/Utils/callsWriter')
const FaceBookAPI = require('./src/FaceBookAPI');
const { TokenManager, CallType } = require('./src/TokenManager');

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
            const res = await fbApi.call(url);

            if (writeInfile)
                await callsWriter.appendToJsonFile(fileName, res);

        } catch (e) {
            console.log(e);
        }
    }
}

setUp = async() => {
    const accessTokens = [
        'EAAYgrrV0uxYBABsX93y8JXakqdYtHfEDNVnp04JcaJIvAOKXmCP1gSVZCad57H8jlfknJCu7MIZAoZCpgsqsyZCQvZBP9uR2bvJnKsko7lLvQchBfbLWQfHHJzXDkEF4tbpZCLCCTnuHa5i1JfPNEv0dfuezyCIEvB0Cqg4Ce8zGDW0wXmeyNFXAehwczxqxYZD',
        'EAALDOhsLbBIBACZCD3tjCjTb3tEVFNthGA5u7jsn6n1j1lvHd7jUc5NJVhnHtMuukIn2jA8byK4YzdtI9JKfac0zRHnmPmg2kn35zSUZAj4LA9R92wUHLgb3h49G3Gdj6tSlp014aeZAMlMSRnvpbGYZBPOBY2rGwDehSrl8ZA9w235QUB4JU49t8ebpaaJMIZAC34fiaXaQZDZD'
    ]

    for (i = 0; i < accessTokens.length; i++) {
        const accessToken = accessTokens[i];
        await fbApi.callByAccessToken('https://graph.facebook.com/v4.0/me?fields=id,name&', accessToken)
    }
}

(async() => {
    await setUp();

    const check = 2;
    switch (check) {
        case 0:
            {
                const totalDuration = await callsWriter.setDurationForEachCall('results.json');
                console.log(`totalDuration: ${totalDuration} seconds`); //256
                break;
            }
        case 1:
            {
                const url = `https://graph.facebook.com/v4.0/me/feed?limit=100&`;
                await continuosCallFBookAndLog(url, 'results.json', false)
                break;
            }
        case 2:
            {
                const url = 'https://graph.facebook.com/v4.0/me?fields=id,name&';
                const tokenInfo = await fbApi.call(url)
                console.log(tokenInfo);
                break;
            }
    }
})()