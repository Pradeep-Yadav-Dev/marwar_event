import { Router, Request, Response } from "express";

const router = Router();

// POST admin login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Standard default admin credentials for quick access & demo
    if (email === "admin@marwarevents.com" && password === "admin123") {
      return res.json({
        success: true,
        message: "Login successful",
        token: "demo_admin_jwt_token_marwar_events_2026",
        user: {
          id: 1,
          name: "Chief Event Administrator",
          email: "admin@marwarevents.com",
          role: "admin",
        },
      });
    }

    // Allow custom login or notify wrong credentials
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid credentials. Use admin@marwarevents.com / admin123",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Login failed" });
  }
});

export default router;

