
import {monthBorder} from '../constants/config.js';

export function dateFilter(year, month) {
    return (item) => {
        const endDate = new Date(year, month - 1, monthBorder);
        const startDate = new Date(endDate);
        startDate.setMonth((getLastMonth(month) - 1));
        if (startDate.getMonth() === 11) startDate.setYear(year - 1);


        return item.bookingDay >= startDate && item.bookingDay < endDate;
    }
}

export function getLastMonth(month) {
    return (month === 1) ? 12 : --month;
}

export function subtractFromMonth(month, amount) {
    return (((month-amount)%12)+12)%12
}