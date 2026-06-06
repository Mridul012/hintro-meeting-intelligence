declare global {
  namespace Express {
    interface Request {
      traceId: string;
      user: {
        userId: string;
        email: string;
      };
    }
  }
}
export {};
