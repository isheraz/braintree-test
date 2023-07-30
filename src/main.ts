import 'dotenv/config';
import express from 'express';
import { createPayment, executePayment } from './services/braintree';
import { serverStart } from './services/main';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

export const app = express();

app.get('/', serverStart);

// Route to initiate the payment request
app.post('/payment/create', createPayment);

// Route to handle payment approval and execute the payment
app.post('/payment/execute', executePayment);


app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  console.log(`[ ENV ] .env File`);
  console.group(process.env);
});
