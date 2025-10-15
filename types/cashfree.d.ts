declare module '@cashfreepayments/cashfree-js' {
    export interface CashfreeInstance {
        checkout(options: CheckoutOptions): void
    }

    export interface CheckoutOptions {
        paymentSessionId: string
        redirectTarget?: '_self' | '_blank' | '_parent' | '_top'
    }

    export interface LoadOptions {
        mode: 'sandbox' | 'production'
    }

    export function load(options: LoadOptions): Promise<CashfreeInstance>
}
