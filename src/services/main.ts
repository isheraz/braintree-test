import { Request, Response } from 'express';

export const serverStart = (_req: Request, res: Response) => {
    res.send({ message: 'Solution for Payment API, Test Implementation', author: 'Sheraz Ahmed' });
};