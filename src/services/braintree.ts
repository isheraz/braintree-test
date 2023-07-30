import { Request, Response } from 'express';
import {
    BraintreeGateway,
    Environment,
    ValidatedResponse,
    ClientToken,
    TransactionRequest,
    Transaction,
    ClientTokenRequest
} from 'braintree';

import { APP_MODE } from '../enums';

const gateway = new BraintreeGateway({
    environment: process.env.APP_MODE === APP_MODE.PROD ? Environment.Production : Environment.Sandbox,
    merchantId: process.env.BT_MERCHANT_ID,
    publicKey: process.env.BT_PUBLIC_KEY,
    privateKey: process.env.BT_PRIVATE_KEY,
});

export async function createPayment(req: Request, res: Response) {

    const requestToken: ClientTokenRequest = {}

    const response: ValidatedResponse<ClientToken> = await gateway.clientToken.generate(requestToken);
    try {
        const clientToken = response.clientToken;
        res.send(clientToken);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to Generate client Token')
    }
}


export async function executePayment(req: Request, res: Response) {
    console.log(req.body)
    const nonce = req.body.payment_method_nonce;
    const amount = '10.00'; // amount

    const transactionRequest: TransactionRequest = {
        amount,
        paymentMethodNonce: nonce,
        options: {
            submitForSettlement: true,
        },
    };

    const result: ValidatedResponse<Transaction> = await gateway.transaction.sale(transactionRequest);
    try {
        if (!result.success) {
            // Payment failed
            // TODO: Handle payment failure scenario here
            console.error('Payment failed:', result.message);
            res.status(400).send('Payment failed.');
        }
        // Payment was successful
        // TODO: Handle success scenario here, e.g., update order status, send confirmation emails, etc.
        res.status(200).send('Payment was successful!');
    } catch (error) {
        console.error('Error processing payment:', error.message);
        res.status(500).send('Failed to process payment.');
    }
}
