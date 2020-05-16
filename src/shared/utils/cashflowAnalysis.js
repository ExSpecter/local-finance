import {dateFilter, subtractFromMonth} from './dateFilter'
import {similarThreshold} from '../constants/config';

class CashflowWithSimilars {
    constructor(item) {
        this.item = item
        this.similarItems = []
    }

    setSimilarItems(index, items) {
        this.similarItems[index] = items
    }

    getAllSimilarItems() {
        return this.similarItems.reduce((acc, items) => ([...acc, ...items]), [])
    }
}

export default class CashflowAnalysis {
    constructor(cashflowList, depth, considerAmount = true) {
        this.cashflowList = [...cashflowList];
        this.depth = depth;
        this.considerAmount = considerAmount;

        this.cashflowsWithSimilarItems = []
    }

    calculate(month) {
        const cashflows = getLastXMonth(this.depth, month, this.cashflowList)

        this.cashflowsWithSimilarItems = cashflows[0].map(cashflow => new CashflowWithSimilars(cashflow));
        for(let i = 1; i < cashflows.length; i++) {
            this.cashflowsWithSimilarItems.forEach(baseCashflow => {
                const similarItems = getSimilarItems(baseCashflow.item, cashflows[i], this.considerAmount);
                baseCashflow.setSimilarItems(i - 1, similarItems);
            });
        }
    }

    getPeriodical(month) {
        this.calculate(month);
        const periodicals = this.cashflowsWithSimilarItems.filter(item => {
            if(!item.similarItems.length && this.depth > 0) return false;
            return item.similarItems.reduce((acc, item) => acc && !!item, true);
        });

        const innerMergedPeriodicals = mergeDuplicates(periodicals);
        return innerMergedPeriodicals;
    }
}

function getLastXMonth(x, month, cashflowList) {
    let cashflows = [];
    for(let i = 0; i <= x; i++) {
        cashflows[i] = cashflowList.filter(dateFilter(2020, subtractFromMonth(month, i))) // TODO
    }
    return cashflows;
}

function getSimilarItems(cashflowItem, cashflowList, considerAmount) {
    const similarities = cashflowList.map(item => item.getSimilarity(cashflowItem, considerAmount))
    const similarItems = cashflowList.filter((_, index) => similarities[index] > similarThreshold);
    if(similarItems.length == 0) return null;

    return similarItems;
}

function mergeDuplicates(cashflowList) {
    return cashflowList.reduce((acc, cashflowWithSimilars) => {
        const similars = getSimilarItems(cashflowWithSimilars.item, acc.map(item => item.item), false);
        if(!similars) {
            acc.push(cashflowWithSimilars);
            cashflowWithSimilars.item.mergedItems = []
        } else similars[0].mergedItems.push(cashflowWithSimilars.item);
        return acc;
    }, []);
}