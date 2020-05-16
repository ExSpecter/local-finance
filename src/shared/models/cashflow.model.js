import StringSimilarity from 'string-similarity'

const accountExeptions = [
    "DE90700500000002055382", // Siemens Mannheim
    "DE41300606010001463829", // Lupus
]

export default class Cashflow {
    constructor(csvEntry) {
        if(!csvEntry) return; 

        this.contractAccount = csvEntry['Auftragskonto']
        this.bic = csvEntry['BIC (SWIFT-Code)']
        this.amount = parseFloat(csvEntry['Betrag'].replace(',', '.'))
        this.currency = csvEntry['Waehrung']
        this.bookingDay = new Date(convertDayString(csvEntry['Buchungstag']))
        this.bookingText = csvEntry['Buchungstext']
        this.beneficiary = csvEntry['Beguenstigter/Zahlungspflichtiger'].replace(/\s+/g,' ')
        this.beneficiaryId = csvEntry['Glaeubiger ID']
        this.beneficiaryAccount = csvEntry['Kontonummer/IBAN']
        this.customerTestimonials = csvEntry['Kundenreferenz (End-to-End)']
        this.usageText = csvEntry['Verwendungszweck']

        this.mergedItems = []

        this.periodical = null
    }

    getAmount() {
        return this.amount;
    }

    getTotalAmount() {
        return this.mergedItems.reduce((acc, cashflow) => acc + cashflow.amount, 0) + this.amount;
    }

    setPeriodical(periodical) {
        this.periodical = periodical
    }

    hasPeriodical() {
        return this.periodical != null
    }

    isIncome() {
        return this.amount >= 0;
    }

    isEqual(cashflow) {
        return this.bookingDay.getTime() === cashflow.bookingDay.getTime()
            && this.beneficiaryAccount === cashflow.beneficiaryAccount
            && this.amount === cashflow.amount
            && this.usageText === cashflow.usageText;
    }

    getSimilarity(cashflow, considerAmount) {
        if(cashflow.beneficiaryAccount === this.beneficiaryAccount
            && accountExeptions.includes(cashflow.beneficiaryAccount))
            return 1;

        const beneficiarySimilarity = this.beneficiaryAccount === cashflow.beneficiaryAccount;
        if(!beneficiarySimilarity) return 0;

        if(!considerAmount) return 1;

        return getAmountSimilarity(this.amount, cashflow.amount);
    }
}

function convertDayString(day) {
    let split = day.split('.')
    return `20${split[2]}-${split[1]}-${split[0]}`
}

function getAmountSimilarity(a, b) {
    const amountA = Math.abs(a)
    const amountB = Math.abs(b)
    return 1 - (Math.abs(amountA - amountB) / ((amountA + amountB) / 2));
}