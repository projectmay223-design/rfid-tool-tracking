import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, toolsTable } from "@workspace/db";
import {
  ListToolsQueryParams,
  ListToolsResponse,
  CreateToolBody,
  GetToolParams,
  GetToolResponse,
  UpdateToolParams,
  UpdateToolBody,
  UpdateToolResponse,
  DeleteToolParams,
} from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/tools", authMiddleware, async (req, res): Promise<void> => {
  const query = ListToolsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(toolsTable).$dynamic();

  if (query.data.status) {
    dbQuery = dbQuery.where(eq(toolsTable.status, query.data.status));
  } else if (query.data.category) {
    dbQuery = dbQuery.where(eq(toolsTable.category, query.data.category));
  }

  const tools = await dbQuery.orderBy(toolsTable.createdAt);
  res.json(ListToolsResponse.parse(tools));
});

router.post("/tools", authMiddleware, async (req, res): Promise<void> => {
  const parsed = CreateToolBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db.select().from(toolsTable).where(eq(toolsTable.toolId, parsed.data.toolId));
  if (existing.length > 0) {
    res.status(409).json({ error: "Tool ID already exists" });
    return;
  }

  const [tool] = await db.insert(toolsTable).values({
    toolId: parsed.data.toolId,
    name: parsed.data.name,
    category: parsed.data.category,
    status: parsed.data.status ?? "Available",
  }).returning();

  res.status(201).json(GetToolResponse.parse(tool));
});

router.get("/tools/:id", authMiddleware, async (req, res): Promise<void> => {
  const params = GetToolParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [tool] = await db.select().from(toolsTable).where(eq(toolsTable.id, params.data.id));
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  res.json(GetToolResponse.parse(tool));
});

router.put("/tools/:id", authMiddleware, async (req, res): Promise<void> => {
  const params = UpdateToolParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateToolBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.category !== undefined) updates.category = parsed.data.category;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;

  const [tool] = await db
    .update(toolsTable)
    .set(updates)
    .where(eq(toolsTable.id, params.data.id))
    .returning();

  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  res.json(UpdateToolResponse.parse(tool));
});

router.delete("/tools/:id", authMiddleware, async (req, res): Promise<void> => {
  const params = DeleteToolParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [tool] = await db
    .delete(toolsTable)
    .where(eq(toolsTable.id, params.data.id))
    .returning();

  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
