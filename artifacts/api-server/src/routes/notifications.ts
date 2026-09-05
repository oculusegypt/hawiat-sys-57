import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { and, eq, desc, isNull } from "drizzle-orm";
import { requireAdmin, requireNonDriver, requireSectionPermission, type AdminRequest } from "../middleware/adminAuth";

const router = Router();

function requireNotificationAccess(req: Parameters<typeof requireAdmin>[0], res: Parameters<typeof requireAdmin>[1], next: Parameters<typeof requireAdmin>[2]): void {
  const adminRequest = req as AdminRequest;
  if (adminRequest.adminRole === "driver") {
    next();
    return;
  }
  requireNonDriver(req, res, () => requireSectionPermission("notifications")(req, res, next));
}

function notificationVisibility(adminRequest: AdminRequest) {
  return adminRequest.adminRole === "driver"
    ? eq(notificationsTable.recipientAdminId, adminRequest.adminId)
    : isNull(notificationsTable.recipientAdminId);
}

router.get("/notifications", requireAdmin, requireNotificationAccess, async (req, res) => {
  const adminRequest = req as AdminRequest;
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  const notifications = await db.select().from(notificationsTable)
    .where(notificationVisibility(adminRequest))
    .orderBy(desc(notificationsTable.createdAt));
  return res.json(notifications);
});

router.patch("/notifications/:id/read", requireAdmin, requireNotificationAccess, async (req, res) => {
  const adminRequest = req as AdminRequest;
  const id = parseInt(String(req.params.id), 10);
  const [notification] = await db.update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.id, id), notificationVisibility(adminRequest)))
    .returning();
  if (!notification) return res.status(404).json({ error: "Not found" });
  return res.json(notification);
});

router.patch("/notifications/read-all", requireAdmin, requireNotificationAccess, async (req, res) => {
  const adminRequest = req as AdminRequest;
  await db.update(notificationsTable).set({ isRead: true }).where(notificationVisibility(adminRequest));
  return res.json({ success: true });
});

// Admin: delete single notification
router.delete("/admin/notifications/:id", requireAdmin, requireNonDriver, requireSectionPermission("notifications"), async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  const [existing] = await db.select({ id: notificationsTable.id })
    .from(notificationsTable)
    .where(eq(notificationsTable.id, id));
  if (!existing) return res.status(404).json({ error: "Not found" });
  await db.delete(notificationsTable)
    .where(eq(notificationsTable.id, id))
    ;
  return res.json({ success: true });
});

// Admin: delete ALL notifications
router.delete("/admin/notifications", requireAdmin, requireNonDriver, requireSectionPermission("notifications"), async (_req, res) => {
  await db.delete(notificationsTable);
  return res.json({ success: true });
});

export default router;
