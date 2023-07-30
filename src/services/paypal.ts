import { Request, Response } from 'express';
import * as paypal from 'paypal-rest-sdk';
import { APP_MODE } from '../enums';

paypal.configure({
    mode: process.env.APP_MODE === APP_MODE.PROD ? 'live' : 'sandbox',
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

export function createPayment(req: Request, res: Response) {
    // if (req.method !== 'POST) return;
    const paymentData = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal',
        },
        redirect_urls: {
            return_url: `${process.env.APP_URL}/payment/success`,
            cancel_url: `${process.env.APP_URL}/payment/cancel`,
        },
        transactions: [
            {
                amount: {
                    total: '10.00', // Replace with the actual amount
                    currency: 'USD', // Replace with the desired currency
                },
                description: 'Payment for your product/service', // Replace with the actual description
            },
        ],
    };

    paypal.payment.create(paymentData, (error, payment) => {
        if (error) {
            console.error('Error creating PayPal payment:', error.message);
            res.status(500).send('Failed to create PayPal payment.');
        }
        const approvalUrl = payment.links.find((link) => link.rel === 'approval_url');
        if (approvalUrl) {
            res.redirect(approvalUrl.href);
        } else {
            console.error('Approval URL not found in PayPal response.');
            res.status(500).send('Failed to create PayPal payment.');
        }
    });
}

export function executePayment(req: Request, res: Response) {
    const { paymentId, payerId } = req.body;

    const executeData = {
        payer_id: payerId,
    };

    paypal.payment.execute(paymentId, executeData, (error, payment) => {
        if (error) {
            console.error('Error executing PayPal payment:', error.message);
            res.status(500).send('Failed to execute PayPal payment.');
        } else {
            // Payment was successful
            // Handle success scenario here, e.g., update order status, send confirmation emails, etc.
            res.status(200).send('Payment was successful!');
        }
    });
}
