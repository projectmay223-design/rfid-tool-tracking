import { Router, type IRouter } from "express";
import { db, toolsTable } from "@workspace/db";
import { InventoryScanBody, InventoryScanResponse } from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/scan", authMiddleware, async (req, res): Promise<void> => {
  const parsed = InventoryScanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { scannedTools } = parsed.data;

  const allTools = await db.select().from(toolsTable);
  const allToolIds = new Set(allTools.map((t) => t.toolId));
  const scannedSet = new Set(scannedTools);

  const correctTools: string[] = [];
  const missingTools: string[] = [];
  const extraTools: string[] = [];

  for (const toolId of allToolIds) {
    if (scannedSet.has(toolId)) {
      correctTools.push(toolId);
    } else {
      missingTools.push(toolId);
    }
  }

  for (const toolId of scannedSet) {
    if (!allToolIds.has(toolId)) {
      extraTools.push(toolId);
    }
  }

  res.json(InventoryScanResponse.parse({
    correctTools,
    missingTools,
    extraTools,
    summary: {
      total: allToolIds.size,
      correct: correctTools.length,
      missing: missingTools.length,
      extra: extraTools.length,
    },
  }));
});

export default router;
