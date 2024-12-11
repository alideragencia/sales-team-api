
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express from 'express';
import { routes } from './http/routes';
import cors from 'cors';
import errorHandling from './http/middlewares/error-handling';

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));
app.use(routes);



app.use(errorHandling)

import './jobs';
