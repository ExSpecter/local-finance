import { createDbCashflowHandler } from './features/cashflow';
import { createDbPeriodicalHandler } from './features/periodicals';

export const dbCashflow = createDbCashflowHandler();
export const dbPeriodicals = createDbPeriodicalHandler();