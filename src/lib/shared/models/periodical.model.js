import Cashflow from './cashflow.model'

export default class Periodical {
    constructor(periodical) {
        this.beneficiary = '';
        this.amount = 0;
        this.valueIsMonthly = true;
        this.comment = '';

        if(periodical) Object.assign(this, periodical);
    }

    static fromCashflow(cashflow) {
        const periodical = new Periodical();
        if(!cashflow) return periodical;
        periodical.beneficiary = cashflow.beneficiary;
        periodical.amount = cashflow.getTotalAmount() || cashflow.getAmount();
        periodical.comment = cashflow.usageText;
        return periodical;
    }

    getAmount() {
        return this.valueIsMonthly ? this.amount : this.amount / 12
    }

    getTotalAmount() {
        return this.getAmount();
    }

    setIsMonthly() {
        this.valueIsMonthly = true
    }
    setIsYearly() {
        this.valueIsMonthly = false
    }

    isIncome() {
        return this.amount >= 0;
    }
}