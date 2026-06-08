import express, {NextFunction, Request, Response} from  'express';
import { AppError } from '../utils/appError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

//when route not found
export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction)=>{
    res.status(404).send("Page not found!!!");
}