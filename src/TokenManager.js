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
        this.tokens.push({
            accessToken,
            call_count: 0,
            total_cputime: 0,
            total_time: 0,
            code: 200
        })
    }

    updateToken(accessToken, batch) {
        const token = this.tokens.filter(t => t.accessToken === accessToken)[0];
        if (!token)
            throw new Error('token not exist');

        token = {...token, ...batch };
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
        let lowCallsToken, lowCpuToken, lowTimeToken;

        if (ConsumptionType.Calls === callType) {
            lowCallsToken = getMin(availableToken, 'call_count');
            return lowCallsToken
        }

        if (ConsumptionType.CPU === callType) {
            lowCpuToken = getMin(availableToken, 'total_cputime');
            return lowCpuToken
        }

        if (ConsumptionType.Time === callType) {
            lowTimeToken = getMin(availableToken, 'total_time');
            return lowTimeToken
        }

        return getMin([lowCallsToken, lowCpuToken, lowTimeToken]);
    }
}

module.exports = {
    ConsumptionType,
    TokenManager,
}