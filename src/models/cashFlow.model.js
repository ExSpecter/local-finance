export default class Cashflow {
    constructor(csvEntry) {
        this.contractAccount = csvEntry['Auftragskonto']
        this.bic = csvEntry['BIC (SWIFT-Code)']
        this.beneficiary = csvEntry['Beguenstigter/Zahlungspflichtiger'].replace(/\s+/g,' ')
        this.amount = parseFloat(csvEntry['Betrag'])
        this.bookingDay = new Date(csvEntry['Buchungstag'])
        this.bookingText = csvEntry['Buchungstext']
        this.beneficiaryId = csvEntry['Glaeubiger ID']
        this.beneficiaryAccount = csvEntry['Kontonummer/IBAN']
        this.customerTestimonials = csvEntry['Kundenreferenz (End-to-End)']
        this.usageText = csvEntry['Verwendungszweck']
        this.currency = csvEntry['Waehrung']
    }

    isIncome() {
        return this.amount >= 0;
    }
}