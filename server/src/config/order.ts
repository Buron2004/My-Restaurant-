// The server is the source of truth for these — the client only mirrors them for messaging.
export const MIN_ORDER_KOBO = 500000 // ₦5,000
export const MAX_QUANTITY_PER_ITEM = 20

// Placeholder details by default. Set BANK_NAME / BANK_ACCOUNT_NAME / BANK_ACCOUNT_NUMBER
// in server/.env (and on Railway) to use real ones, with no code change.
export function getBankDetails() {
  return {
    bankName: process.env.BANK_NAME ?? 'Sample Bank',
    accountName: process.env.BANK_ACCOUNT_NAME ?? 'Harvest & Ember Restaurant',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? '0123456789',
  }
}