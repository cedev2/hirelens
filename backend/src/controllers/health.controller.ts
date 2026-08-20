import { Request, Response } from "express";

const healthControllers = {
  checkHealth(req: Request, res: Response) {
    return res.status(200).json({ message: "200 OK" });
  },
};

export { healthControllers };
