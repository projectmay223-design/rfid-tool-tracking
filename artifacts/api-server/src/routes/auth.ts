import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { RegisterBody, LoginBody, LoginResponse } from "@workspace/api-zod";
import { generateToken } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, password } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ name, email, password: hashedPassword }).returning();

  const token = generateToken(user.id, user.email);

  res.status(201).json(LoginResponse.parse({
    token,
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
  }));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = generateToken(user.id, user.email);

  res.json(LoginResponse.parse({
    token,
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
  }));
});

export default router;
