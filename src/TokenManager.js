const ConsumptionType = Object.freeze({
    Calls: 0,
    CPU: 1,
    Time: 2
});

class TokenManager {

    constructor() {
        this.tokens = [];
    }

    addNewToken(accessToken, info) {
        let token = {
            id: this.tokens.length,
            accessToken,
            call_count: 0,
            total_cputime: 0,
            total_time: 0,
            code: 200
        }
        token = Object.assign(token, info);
        this.tokens.push(token);

        return token;

    }

    upsertToken(accessToken, batch) {
        let token = this.tokens.filter(t => t.accessToken === accessToken)[0];
        if (!token)
            return this.addNewToken(accessToken, batch);

        token = Object.assign(token, batch);
        return token;
    }

    getTokenByStatusCode(code) {
        return this.tokens.filter(t => {
            return t.code === code;
        })
    }

    getValidTokens() {
        return this.getTokenByStatusCode(200);
    }

    findLowerConsumedToken(callType) {

        const validTokens = this.getValidTokens();
        if (!validTokens || validTokens.length === 0)
            return null;

        const getMin = (arr, propertyName) => {
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