import { Request, Response } from 'express';
import braintree from 'braintree';

import { createPayment, executePayment } from 'src/services/braintree';


// Mock Express Request and Response objects
const mockRequest = {} as Request;
const mockResponse = {
  send: jest.fn(),
  status: jest.fn(() => mockResponse),
} as unknown as Response;

// Mock Braintree clientToken.generate and transaction.sale methods
const mockClientToken = 'MOCK_CLIENT_TOKEN';
const mockPaymentMethodNonce = `MOCK_NONCE_${new Date().getTime()}`;
const mockPaymentResult = { success: true, message: '' };


jest.mock('braintree', () => ({
  Environment: {
    Sandbox: 'sandbox',
  },
  BraintreeGateway: jest.fn(() => ({
    clientToken: {
      generate: jest.fn(() => Promise.resolve({ clientToken: mockClientToken })),
    },
    transaction: {
      sale: jest.fn(() => Promise.resolve(mockPaymentResult)),
    },
  })),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('Payment API Tests', () => {



  describe('createPayment', () => {

    it('should generate and send the client token', async () => {
      await createPayment(mockRequest, mockResponse);

      expect(mockResponse.send).toHaveBeenCalledWith(mockClientToken);
    });

    xit('should handle errors during client token generation', async () => {
      const errorMessage = 'Error generating client token';
      jest.spyOn(console, 'error').mockImplementationOnce(() => ({}));

      // Mocking clientToken.generate to return a rejected promise
      jest.spyOn(braintree.BraintreeGateway.prototype.clientToken, 'generate')
        .mockRejectedValue(new Error(errorMessage));

      await createPayment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('Failed to generate client token.');
      expect(console.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('executePayment', () => {
    it('should execute the payment and send success response', async () => {
      mockRequest.body = { payment_method_nonce: mockPaymentMethodNonce };

      await executePayment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith('Payment was successful!');
    });

    xit('should handle payment failure and send failure response', async () => {
      mockPaymentResult.success = false;
      mockPaymentResult.message = 'Payment declined';

      mockRequest.body = { payment_method_nonce: mockPaymentMethodNonce };

      await executePayment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith('Payment failed.');
      expect(console.error).toHaveBeenCalledWith('Payment failed:', mockPaymentResult.message);
    });

    xit('should handle errors during payment processing', async () => {
      const errorMessage = 'Error processing payment';
      jest.spyOn(console, 'error').mockImplementationOnce(() => ({}));

      mockRequest.body = { payment_method_nonce: mockPaymentMethodNonce };

      // Mocking transaction.sale to return a rejected promise
      jest.spyOn(braintree.BraintreeGateway.prototype.transaction, 'sale')
        .mockRejectedValue(new Error(errorMessage));

      await executePayment(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('Failed to process payment.');
      expect(console.error).toHaveBeenCalledWith(errorMessage);
    });
  });
});
