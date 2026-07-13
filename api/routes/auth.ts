import { Router, type Request, type Response } from "express";

const router = Router();

const notImplemented = (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: `${req.method} ${req.path} 仅保留为模板接口，当前项目未启用认证模块`,
  });
};

router.post("/register", notImplemented);
router.post("/login", notImplemented);
router.post("/logout", notImplemented);

export default router;
