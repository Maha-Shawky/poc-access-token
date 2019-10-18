const ConsumptionType = Object.freeze({
    Calls: 0,
    CPU: 1,
    Time: 2
});

class TokenManager {

    constructor() {
        this.tokens = [];
    }

    upsertToken(accessToken, batch) {
        let token = this.tokens.filter(t => t.accessToken === accessToken)[0];
        if (!token) {
            token = {
                accessToken,
                call_count: 0,
                total_cputime: 0,
                total_time: 0,
                code: 200
            }
        }

        token = {...token, ...batch };
        return token;
    }

    getTokenByStatusCode(code) {
        return this.tokens.filter(t => {
            return t.code === code;
        })
    }

    getAvailableToken() {
        return this.getTokenByStatusCode(200);
    }

    findLowerConsumedToken(callType) {

        const getMin = (arr, propertyName) => {
            arr.reduce((prev, cur) => {
                return prev[propertyName] < cur[propertyName] ? prev : cur;
            })
        }

        const availableToken = this.getAvailableToken();

        if (ConsumptionType.Calls === callType) {
            return getMin(availableToken, 'call_count');
        }

        if (ConsumptionType.CPU === callType) {
            return getMin(availableToken, 'total_cputime');
        }

        if (ConsumptionType.Time === callType) {
            return getMin(availableToken, 'total_time');
        }

        const lowestConsumedToken = availableToken.reduce((prev, cur) => {
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