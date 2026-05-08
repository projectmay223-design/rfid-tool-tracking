import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, toolsTable, transactionsTable } from "@workspace/db";
import {
  IssueToolBody,
  IssueToolResponse,
  ReturnToolBody,
  ReturnToolResponse,
  ListTransactionsQueryParams,
  ListTransactionsResponse,
} from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/issue", authMiddleware, async (req, res): Promise<void> => {
  const parsed = IssueToolBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { toolId, userId } = parsed.data;

  const [tool] = await db.select().from(toolsTable).where(eq(toolsTable.toolId, toolId));
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  if (tool.status === "Issued") {
    res.status(400).json({ error: "Tool already issued" });
    return;
  }

  if (tool.status !== "Available") {
    res.status(400).json({ error: "Tool is not available" });
    return;
  }

  await db.update(toolsTable).set({ status: "Issued" }).where(eq(toolsTable.toolId, toolId));

  const [tx] = await db.insert(transactionsTable).values({
    toolId,
    userId,
    actionType: "issue",
    issueDate: new Date(),
  }).returning();

  res.json(IssueToolResponse.parse({
    ...tx,
    toolName: tool.name,
  }));
});

router.post("/return", authMiddleware, async (req, res): Promise<void> => {
  const parsed = ReturnToolBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { toolId } = parsed.data;

  const [tool] = await db.select().from(toolsTable).where(eq(toolsTable.toolId, toolId));
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  if (tool.status !== "Issued") {
    res.status(400).json({ error: "Tool is not issued" });
    return;
  }

  await db.update(toolsTable).set({ status: "Available" }).where(eq(toolsTable.toolId, toolId));

  const [tx] = await db.insert(transactionsTable).values({
    toolId,
    userId: null,
    actionType: "return",
    returnDate: new Date(),
  }).returning();

  res.json(ReturnToolResponse.parse({
    ...tx,
    toolName: tool.name,
  }));
});

router.get("/transactions", authMiddleware, async (req, res): Promise<void> => {
  const query = ListTransactionsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select({
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
    .$dynamic();

  if (query.data.toolId) {
    dbQuery = dbQuery.where(eq(transactionsTable.toolId, query.data.toolId));
  }

  const limit = query.data.limit ?? 50;
  const transactions = await dbQuery.orderBy(desc(transactionsTable.createdAt)).limit(limit);

  res.json(ListTransactionsResponse.parse(transactions));
});

export default router;
