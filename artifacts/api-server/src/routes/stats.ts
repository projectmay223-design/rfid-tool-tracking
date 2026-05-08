import { Router, type IRouter } from "express";
import { eq, count, desc } from "drizzle-orm";
import { db, toolsTable, transactionsTable } from "@workspace/db";
import { GetStatsResponse } from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/stats", authMiddleware, async (req, res): Promise<void> => {
  const allTools = await db.select().from(toolsTable);

  const totalTools = allTools.length;
  const availableTools = allTools.filter((t) => t.status === "Available").length;
  const issuedTools = allTools.filter((t) => t.status === "Issued").length;
  const missingTools = allTools.filter((t) => t.status === "Missing").length;

  const [txCount] = await db.select({ value: count() }).from(transactionsTable);
  const totalTransactions = txCount?.value ?? 0;

  const recentTransactions = await db
    .select({
      id: transactionsTable.id,
      toolId: transactionsTable.toolId,
      userId: transactionsTable.userId,
      actionType: transactionsTable.actionType,
      issueDate: transactionsTable.issueDate,
      returnDate: transactionsTable.returnDate,
      createdAt: transactionsTable.createdAt,
      toolName: toolsTable.name,
    })
    .from(transactionsTable)
    .leftJoin(toolsTable, eq(transactionsTable.toolId, toolsTable.toolId))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(10);

  const categoryMap = new Map<string, number>();
  for (const tool of allTools) {
    categoryMap.set(tool.category, (categoryMap.get(tool.category) ?? 0) + 1);
  }
  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
  }));

  res.json(GetStatsResponse.parse({
    totalTools,
    availableTools,
    issuedTools,
    missingTools,
    totalTransactions,
    recentTransactions,
    categoryBreakdown,
  }));
});

export default router;
