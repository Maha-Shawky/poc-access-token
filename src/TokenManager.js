const ConsumptionType = Object.freeze({
    Calls: 0,
    CPU: 1,
    Time: 2
});

class TokenManager {

    constructor() {
        this.tokens = [];
    }

    addNewToken(accessToken) {
        const token = {
            accessToken,
            call_count: 0,
            total_cputime: 0,
            total_time: 0,
            code: 200
        }

        this.tokens.push(token)
        return token;
    }

    updateToken(accessToken, batch) {
        let token = this.tokens.filter(t => t.accessToken === accessToken)[0];
        if (!token)
            throw new Error('token not exist');

        token = {...token, ...batch };
        return token;
    }

    getUnAvailableToken() {
        return this.tokens.filter(t => {
            return t.call_count >= 100 || t.total_cputime >= 100 || t.total_time >= 100;
        })
    }

    getAvailableToken() {
        return this.tokens.filter(t => {
            return t.call_count < 100 && t.total_cputime < 100 && t.total_time < 100;
        })
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