const ConsumptionType = Object.freeze({
    Calls: 0,
    CPU: 1,
    Time: 2
});

class TokenManager {

    constructor() {
        this.tokens = [];
    }

    setTokenUpdateTime(token) {
        const now = new Date().toISOString();

        token.lastUsed = now;
        if (token.code === 200)
            token.lastSuccessfullyCalled = now;
    }
    addNewToken(accessToken, info) {
        let token = {
            id: this.tokens.length,
            accessToken
        }

        token = Object.assign(token, info);
        this.setTokenUpdateTime(token);
        this.tokens.push(token);

        return token;
    }

    upsertToken(accessToken, batch) {
        let token = this.tokens.filter(t => t.accessToken === accessToken)[0];
        if (!token)
            return this.addNewToken(accessToken, batch);

        token = Object.assign(token, batch);
        this.setTokenUpdateTime(token);
        return token;
    }

    getTokensByStatus(code) {
        return this.tokens.filter(token => token.code === code);
    }

    getTokensByLastSuccessfullyCalled(code, minutes) {

        return this.getTokensByStatus(code)
            .filter(token => {
                if (!token.lastSuccessfullyCalled)
                    return true;

                const timeDiff = new Date() - new Date(token.lastSuccessfullyCalled);
                return timeDiff >= minutes * 60000;
            })
    }

    findLowerConsumedToken(callType) {

        const validTokens = this.getTokensByStatus(200);
        if (!validTokens || validTokens.length === 0)
            return null;

        const getMin = (arr, propertyName) => {
            if (arr.length === 1)
                return arr[0];

            arr.reduce((prev, cur) => {
                return prev[propertyName] < cur[propertyName] ? prev : cur;
            })
        }

        if (ConsumptionType.Calls === callType) {
            return getMin(validTokens, 'call_count');
        }

        if (ConsumptionType.CPU === callType) {
            return getMin(validTokens, 'total_cputime');
        }

        if (ConsumptionType.Time === callType) {
            return getMin(validTokens, 'total_time');
        }

        const lowestConsumedToken = validTokens.reduce((prev, cur) => {
            return Math.max(prev.call_count, prev.total_cputime, prev.total_time) <
                Math.max(cur.call_count, cur.total_cputime, cur.total_time) ? prev : cur;
        })

        return lowestConsumedToken;
    }
}

module.exports = {
    ConsumptionType,
    TokenManager,
}