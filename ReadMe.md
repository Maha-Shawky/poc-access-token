## The purpose of this POC:
Is to select access token from pool of access tokens based on its usage, pull lowest usage first

## Steps:
-   create accessTokens.json file, then add access token in this file, as accessTokens-Example.json

-   ``` npm run start```  to start crawling using valid tokens from pool of access tokens.

-    Watch the log to see initial status of access tokens after setup section, and how crawling switch between them to use lowest usage access token

## Valid tokens means:
None of its (call_count, total_cputime, total_time) reached 100 %  check [Rate imit](https://developers.facebook.com/docs/graph-api/overview/rate-limiting/)

## Most important function:
- *TokenManager::findLowerConsumedToken*: which fnd min valid token either based on one of usage types or the one has min of all types,

i.e. It could be used to find valid token with lowest "total_time", or token with lowest "total_time" or lowest combination of the 3 metrics.

- *index::checkIfLimitedTokenReleased*: which could be used periodically to ping by rate limited tokens to check if their usage decreased and can be reused or not.

## Notes
-   This repo is just POC, code not optimized :)
