import request from 'supertest';
import * as braintree from 'braintree'; // Import the Braintree module for mocking
import { app } from 'src/main'; // Assuming your Express app is exported as 'app' in a file called 'app.ts'

// // Mock the Braintree clientToken.generate function
// jest.mock('braintree', () => ({
//     Environment: {
//         Sandbox: 'sandbox',
//       },
//   BraintreeGateway: jest.fn().mockImplementation(() => ({
//     clientToken: {
//       generate: jest.fn().mockResolvedValue({ clientToken: 'MOCK_CLIENT_TOKEN' }),
//     },
//     transaction: {
//       sale: jest.fn().mockResolvedValue({ success: true }), // For successful execution
//       // sale: jest.fn().mockResolvedValue({ success: false, message: 'Payment declined' }), // For failure execution
//     },
//   })),
// }));

const MOCK_NONCE = `MOCK_NONCE_${new Date().getTime()}`;

describe('Payment API E2E Tests', () => {
    it('should generate a client token', async () => {
        const response = await request(app).post('/payment/create');
        console.log(response.text);
        expect(response.status).toBe(200);
        expect(response.text).not.toBeNull();
    });

    xit('should handle payment execution and return success', async () => {
        const executeResponse = await request(app)
            .post('/payment/execute')
            .send({ payment_method_nonce: MOCK_NONCE }); // Replace 'MOCK_NONCE' with a valid nonce for testing
        expect(executeResponse.status).toBe(200);
        expect(executeResponse.text).toContain('Payment was successful!');
    });

    xit('should handle payment execution failure', async () => {
        // Mock the transaction.sale function to simulate a failed payment execution
        jest.spyOn(braintree.BraintreeGateway.prototype.transaction, 'sale')
            .mockResolvedValue({ success: false, message: 'Payment declined' } as braintree.ValidatedResponse<braintree.Transaction>);

        const executeResponse = await request(app)
            .post('/payment/execute')
            .send({ payment_method_nonce: 'INVALID_NONCE' }); // Replace 'INVALID_NONCE' with an invalid nonce for testing
        expect(executeResponse.status).toBe(400);
        expect(executeResponse.text).toContain('Payment failed.');
    });
});
