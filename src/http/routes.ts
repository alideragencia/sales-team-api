import { Router } from "express";
import { scrapperPosts, scrapperQueues } from "./controllers";

export const routes = Router();


import { Request, Response } from 'express';

routes.get('/', (request: Request, response: Response) => {
  return response.status(200).json({ message: 'Welcome to Redrive Instagram Scrapper API!' });
})

routes.post('/scrapper-post', scrapperPosts)
routes.post('/scrapper-queues', scrapperQueues)