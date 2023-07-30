import 'dotenv/config';
import express from 'express';
import { createPayment, executePayment } from './services/paypal';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.get('/', (req, res) => {
  res.send({ message: 'Solution for Payment API, Test Implementation' });
});

// Route to initiate the payment request
app.post('/payment/create', createPayment);

// Route to handle payment approval and execute the payment
app.post('/payment/execute', executePayment);


app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
