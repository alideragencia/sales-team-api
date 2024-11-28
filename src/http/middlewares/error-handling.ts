// Express
import { NextFunction, Request, Response } from 'express';

interface MessageProps {
    error: string;
    status: number;
    message?: string;
    UIDescription?: string;
    details?: Array<object | string>;
    data?: object;
}

export default async (e: Error, request: Request, response: Response, next: NextFunction) => { // eslint-disable-line 

    console.log(`Error =>`);
    console.log(e);

    return response.status(500).json({});
};





