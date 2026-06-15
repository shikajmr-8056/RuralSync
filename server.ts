import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// ─── Supabase Client ─────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus =
  | "Created" | "Buffered Offline" | "Synced" | "Approved"
  | "Payment Pending" | "Paid" | "In Transit" | "Delivered"
  | "Proposed" | "Failed" | "Pending";

type StorageLocation = "Cloud" | "ESP32 Local Buffer";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const randomId = (prefix = "") =>
  prefix + Math.random().toString(36).substring(2, 9);

/** Derive a sensible Indian rupee price per unit from the product name */
function autoPricePerUnit(productName: string): number {
  const name = productName.toLowerCase();
  if (name.includes("pump")) return 8500;
  if (name.includes("battery") || name.includes("solar")) return 12000;
  if (name.includes("sensor") || name.includes("probe")) return 2200;
  if (name.includes("seed") || name.includes("wheat") || name.includes("rice")) return 850;
  if (name.includes("fertilizer") || name.includes("phosphate") || name.includes("fertiliser")) return 1100;
  if (name.includes("gate") || name.includes("gateway") || name.includes("lora") || name.includes("module")) return 9500;
  if (name.includes("pipe") || name.includes("drip") || name.includes("irrig")) return 3200;
  if (name.includes("controller")) return 6800;
  if (name.includes("label") || name.includes("tag") || name.includes("e-paper")) return 450;
  if (name.includes("meter") || name.includes("ferti")) return 3500;
  return 1500; // default
}

/** Add an event row to device_events */
async function addEvent(msg: string) {
  const id = randomId("evt-");
  await supabase.from("device_events").insert({
    id,
    event: msg,
    timestamp: new Date().toISOString(),
  });
  // Trim to 100 rows (keep newest)
  await supabase.rpc("trim_device_events").maybeSingle(); // no-op if proc absent
  return id;
}

/** Read the current internet state */
async function getInternetState(): Promise<boolean> {
  const { data } = await supabase
    .from("app_config")
    .select("is_internet_available")
    .eq("id", 1)
    .single();
  return data?.is_internet_available ?? true;
}

/** Read the device status row */
async function getDeviceStatus() {
  const { data } = await supabase
    .from("device_status")
    .select("*")
    .eq("id", 1)
    .single();
  if (!data) return null;
  return {
    deviceId: data.device_id,
    signalStrength: data.signal_strength,
    memoryUsage: data.memory_usage,
    cpuUsage: data.cpu_usage,
    uptime: data.uptime,
    status: data.status,
    lastHeartbeat: data.last_heartbeat,
    ordersStoredLocally: data.orders_stored_locally,
    ordersSynced: data.orders_synced,
    failedSyncAttempts: data.failed_sync_attempts,
  };
}

/** Update a column on the single device_status row */
async function patchDevice(patch: Record<string, unknown>) {
  await supabase.from("device_status").update(patch).eq("id", 1);
}

/** Fetch all orders sorted newest-first */
async function fetchOrders() {
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("timestamp", { ascending: false });
  return (data ?? []).map(mapOrder);
}

/** Map DB snake_case → camelCase */
function mapOrder(o: Record<string, unknown>) {
  return {
    id: o.id,
    orderId: o.order_id,
    productName: o.product_name,
    quantity: o.quantity,
    retailerName: o.retailer_name,
    priority: o.priority,
    timestamp: o.timestamp,
    status: o.status,
    storageLocation: o.storage_location,
    notes: o.notes ?? "",
    pricePerUnit: o.price_per_unit ?? 1500,
  };
}

// ─── Express Server ───────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ── GET /api/orders ──────────────────────────────────────────────────────────
  app.get("/api/orders", async (_req, res) => {
    const orders = await fetchOrders();
    res.json({ orders });
  });

  // ── POST /api/orders ─────────────────────────────────────────────────────────
  app.post("/api/orders", async (req, res) => {
    const { productName, quantity, retailerName, priority, proposed, notes, pricePerUnit } = req.body;
    if (!productName || !quantity || !retailerName || !priority) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const online = await getInternetState();
    const { data: existing } = await supabase.from("orders").select("id");
    const orderIndex = (existing?.length ?? 0) + 1;
    const orderId = `RS-${1020 + orderIndex}`;
    const id = randomId("ord-");
    // Use provided price or auto-derive from product name
    const resolvedPrice: number = pricePerUnit && Number(pricePerUnit) > 0
      ? Number(pricePerUnit)
      : autoPricePerUnit(productName);

    let status: OrderStatus = proposed ? "Proposed" : online ? "Synced" : "Buffered Offline";
    let storageLocation: StorageLocation = (proposed || !online) ? "ESP32 Local Buffer" : "Cloud";

    await supabase.from("orders").insert({
      id,
      order_id: orderId,
      product_name: productName,
      quantity: Number(quantity),
      retailer_name: retailerName,
      priority,
      timestamp: new Date().toISOString(),
      status,
      storage_location: storageLocation,
      notes: notes ?? "",
      price_per_unit: resolvedPrice,
    });

    if (proposed) {
      await addEvent(`Order Proposal Created: ${orderId} (${productName}) from edge, awaiting merchant approval`);
    } else if (!online) {
      await patchDevice({ orders_stored_locally: orderIndex });
      await addEvent(`Order Buffered: ${orderId} (${productName}) stored in LittleFS /orders.txt`);
    } else {
      await patchDevice({ orders_synced: orderIndex });
      await addEvent(`Order Created: ${orderId} (${productName}) uploaded directly to Cloud database`);
    }

    const { data: newOrder } = await supabase.from("orders").select("*").eq("id", id).single();
    const deviceStatus = await getDeviceStatus();
    res.json({ order: mapOrder(newOrder!), deviceStatus });
  });

  // ── POST /api/orders/:id/approve ─────────────────────────────────────────────
  app.post("/api/orders/:id/approve", async (req, res) => {
    const { id } = req.params;
    const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
    if (!order) return res.status(404).json({ error: "Order not found" });

    await supabase.from("orders").update({ status: "Approved", storage_location: "Cloud" }).eq("id", id);
    await supabase.from("device_status").update({ orders_synced: supabase.rpc as unknown as number }).eq("id", 1);
    await addEvent(`Order Approved: ${order.order_id} (${order.product_name}) accepted by supplier.`);

    const { data: updated } = await supabase.from("orders").select("*").eq("id", id).single();
    const deviceStatus = await getDeviceStatus();
    res.json({ success: true, order: mapOrder(updated!), deviceStatus });
  });

  // ── POST /api/orders/:id/request-payment ─────────────────────────────────────
  app.post("/api/orders/:id/request-payment", async (req, res) => {
    const { id } = req.params;
    const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
    if (!order) return res.status(404).json({ error: "Order not found" });

    await supabase.from("orders").update({ status: "Payment Pending" }).eq("id", id);
    await addEvent(`Payment Requested: ${order.order_id} (${order.product_name}) — customer notified to pay.`);

    const { data: updated } = await supabase.from("orders").select("*").eq("id", id).single();
    const deviceStatus = await getDeviceStatus();
    res.json({ success: true, order: mapOrder(updated!), deviceStatus });
  });

  // ── POST /api/orders/:id/reject ──────────────────────────────────────────────
  app.post("/api/orders/:id/reject", async (req, res) => {
    const { id } = req.params;
    const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
    if (!order) return res.status(404).json({ error: "Order not found" });

    await supabase.from("orders").delete().eq("id", id);
    await addEvent(`Order Rejected: ${order.order_id} (${order.product_name}) declined by supplier`);

    const deviceStatus = await getDeviceStatus();
    res.json({ success: true, deviceStatus });
  });

  // ── POST /api/orders/:id/pay ─────────────────────────────────────────────────
  app.post("/api/orders/:id/pay", async (req, res) => {
    const { id } = req.params;
    const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
    if (!order) return res.status(404).json({ error: "Order not found" });

    await supabase.from("orders").update({ status: "Paid" }).eq("id", id);
    await addEvent(`Payment Received: ${order.order_id} (${order.product_name}) paid by customer.`);

    const { data: updated } = await supabase.from("orders").select("*").eq("id", id).single();
    const deviceStatus = await getDeviceStatus();
    res.json({ success: true, order: mapOrder(updated!), deviceStatus });
  });

  // ── POST /api/orders/:id/dispatch ────────────────────────────────────────────
  app.post("/api/orders/:id/dispatch", async (req, res) => {
    const { id } = req.params;
    const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
    if (!order) return res.status(404).json({ error: "Order not found" });

    await supabase.from("orders").update({ status: "In Transit" }).eq("id", id);
    await addEvent(`Order Dispatched: ${order.order_id} (${order.product_name}) is in transit.`);

    const { data: updated } = await supabase.from("orders").select("*").eq("id", id).single();
    const deviceStatus = await getDeviceStatus();
    res.json({ success: true, order: mapOrder(updated!), deviceStatus });
  });

  // ── POST /api/orders/:id/deliver ─────────────────────────────────────────────
  app.post("/api/orders/:id/deliver", async (req, res) => {
    const { id } = req.params;
    const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
    if (!order) return res.status(404).json({ error: "Order not found" });

    await supabase.from("orders").update({ status: "Delivered" }).eq("id", id);
    await addEvent(`Order Delivered: ${order.order_id} (${order.product_name}) received by customer.`);

    const { data: updated } = await supabase.from("orders").select("*").eq("id", id).single();
    const deviceStatus = await getDeviceStatus();
    res.json({ success: true, order: mapOrder(updated!), deviceStatus });
  });

  // ── GET /api/device/status ───────────────────────────────────────────────────
  app.get("/api/device/status", async (_req, res) => {
    // Jitter CPU/signal and bump uptime
    const { data: current } = await supabase.from("device_status").select("*").eq("id", 1).single();
    if (current) {
      const isOnline = current.status === "ONLINE";
      await patchDevice({
        uptime: current.uptime + 10,
        signal_strength: isOnline ? -60 - Math.floor(Math.random() * 10) : -110,
        cpu_usage: isOnline ? 10 + Math.floor(Math.random() * 10) : 4 + Math.floor(Math.random() * 5),
        last_heartbeat: new Date().toISOString(),
      });
    }
    const deviceStatus = await getDeviceStatus();
    res.json(deviceStatus);
  });

  // ── POST /api/device/status ──────────────────────────────────────────────────
  app.post("/api/device/status", async (req, res) => {
    const { status, signalStrength, memoryUsage, cpuUsage, uptime, ordersStoredLocally } = req.body;
    const patch: Record<string, unknown> = { last_heartbeat: new Date().toISOString() };
    if (status !== undefined) patch.status = status;
    if (signalStrength !== undefined) patch.signal_strength = signalStrength;
    if (memoryUsage !== undefined) patch.memory_usage = memoryUsage;
    if (cpuUsage !== undefined) patch.cpu_usage = cpuUsage;
    if (uptime !== undefined) patch.uptime = uptime;
    if (ordersStoredLocally !== undefined) patch.orders_stored_locally = ordersStoredLocally;
    await patchDevice(patch);
    const deviceStatus = await getDeviceStatus();
    res.json({ message: "Status updated successfully", deviceStatus });
  });

  // ── GET /api/device/events ───────────────────────────────────────────────────
  app.get("/api/device/events", async (_req, res) => {
    const { data } = await supabase
      .from("device_events")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(100);
    const events = (data ?? []).map((e) => ({
      id: e.id,
      event: e.event,
      timestamp: e.timestamp,
    }));
    res.json({ events });
  });

  // ── POST /api/device/events ──────────────────────────────────────────────────
  app.post("/api/device/events", async (req, res) => {
    const { event } = req.body;
    if (!event) return res.status(400).json({ error: 'Missing "event" field' });
    const id = await addEvent(event);
    res.json({ success: true, event: { id, event, timestamp: new Date().toISOString() } });
  });

  // ── GET /api/sync/history ────────────────────────────────────────────────────
  app.get("/api/sync/history", async (_req, res) => {
    const { data } = await supabase
      .from("sync_logs")
      .select("*")
      .order("timestamp", { ascending: false });
    const syncLogs = (data ?? []).map((l) => ({
      id: l.id,
      timestamp: l.timestamp,
      ordersSynced: l.orders_synced,
      result: l.result,
    }));
    res.json({ syncLogs });
  });

  // ── GET /api/network-status ──────────────────────────────────────────────────
  app.get("/api/network-status", async (_req, res) => {
    const isInternetAvailable = await getInternetState();
    res.json({ isInternetAvailable });
  });

  // ── POST /api/network-status ─────────────────────────────────────────────────
  app.post("/api/network-status", async (req, res) => {
    const { available } = req.body;
    if (available === undefined) return res.status(400).json({ error: "Missing available boolean" });

    await supabase.from("app_config").update({ is_internet_available: available }).eq("id", 1);

    if (!available) {
      // ── Going OFFLINE ────────────────────────────────────────────────────────
      await patchDevice({ status: "OFFLINE" });
      await addEvent("📡 ESP32: WiFi disconnected — Internet outage detected");
      await addEvent("💾 ESP32: Switching to LittleFS local buffer mode");
      const deviceStatus = await getDeviceStatus();
      return res.json({ isInternetAvailable: false, deviceStatus, ordersSynced: 0 });
    }

    // ── Restoring ONLINE — auto-sync buffered orders immediately ─────────────
    await patchDevice({ status: "SYNCING" });
    await addEvent("📶 ESP32: WiFi reconnected — Internet link restored!");
    await addEvent("🔄 ESP32: Auto-sync triggered — scanning LittleFS /orders.txt...");

    // Find all offline-buffered orders
    const { data: buffered } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["Buffered Offline", "Pending"]);
    const count = buffered?.length ?? 0;

    if (count > 0) {
      // Promote all buffered → Synced in one query
      await supabase
        .from("orders")
        .update({ status: "Synced", storage_location: "Cloud" })
        .in("status", ["Buffered Offline", "Pending"]);

      // Update device counters
      const { data: ds } = await supabase.from("device_status").select("orders_synced").eq("id", 1).single();
      await patchDevice({
        status: "ONLINE",
        orders_stored_locally: 0,
        orders_synced: (ds?.orders_synced ?? 0) + count,
      });

      // Log each synced order
      for (const o of buffered ?? []) {
        await addEvent(`☁  Uploaded: ${o.order_id} (${o.product_name}) → Cloud DB`);
      }
      await addEvent(`✅ ESP32: Sync complete — ${count} buffered order(s) uploaded to Cloud`);

      // Create a sync log entry
      const logId = randomId("sync-");
      await supabase.from("sync_logs").insert({
        id: logId,
        timestamp: new Date().toISOString(),
        orders_synced: count,
        result: `Auto-sync on network restore: ${count} buffered order(s) uploaded.`,
      });
    } else {
      await patchDevice({ status: "ONLINE" });
      await addEvent("✅ ESP32: No buffered orders — LittleFS queue empty");
    }

    const deviceStatus = await getDeviceStatus();
    res.json({ isInternetAvailable: true, deviceStatus, ordersSynced: count });
  });


  // ── POST /api/sync ───────────────────────────────────────────────────────────
  app.post("/api/sync", async (_req, res) => {
    const online = await getInternetState();
    if (!online) {
      const { data: ds } = await supabase.from("device_status").select("failed_sync_attempts").eq("id", 1).single();
      await patchDevice({ failed_sync_attempts: (ds?.failed_sync_attempts ?? 0) + 1 });
      await addEvent("Sync Attempt Failed: No cloud connectivity");
      return res.status(400).json({ error: "Sync Failed: Cloud backend is currently unreachable from Edge Gateway." });
    }

    const { data: pending } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["Pending", "Buffered Offline"]);
    const count = pending?.length ?? 0;

    if (count === 0) {
      const deviceStatus = await getDeviceStatus();
      return res.json({ message: "No orders to synchronize.", ordersSynced: 0, deviceStatus });
    }

    await patchDevice({ status: "SYNCING" });
    await addEvent(`Synchronization Started: Scanning LittleFS queue containing ${count} buffer files...`);

    // Move all buffered orders → Synced
    await supabase
      .from("orders")
      .update({ status: "Synced", storage_location: "Cloud" })
      .in("status", ["Pending", "Buffered Offline"]);

    const { data: ds } = await supabase.from("device_status").select("orders_synced").eq("id", 1).single();
    await patchDevice({
      orders_stored_locally: 0,
      orders_synced: (ds?.orders_synced ?? 0) + count,
      status: "ONLINE",
    });

    await addEvent(`Synchronization Completed: Uploaded ${count} orders. LittleFS buffer cleared.`);

    const logId = randomId("sync-");
    await supabase.from("sync_logs").insert({
      id: logId,
      timestamp: new Date().toISOString(),
      orders_synced: count,
      result: `Success: Transferred ${count} pending orders to cloud.`,
    });

    const { data: syncLogsData } = await supabase.from("sync_logs").select("*").order("timestamp", { ascending: false });
    const syncLogs = (syncLogsData ?? []).map((l) => ({ id: l.id, timestamp: l.timestamp, ordersSynced: l.orders_synced, result: l.result }));
    const deviceStatus = await getDeviceStatus();

    res.json({ success: true, ordersSynced: count, deviceStatus, syncLogs });
  });

  // ── POST /api/device/restart ─────────────────────────────────────────────────
  app.post("/api/device/restart", async (_req, res) => {
    await patchDevice({ uptime: 0, cpu_usage: 95, memory_usage: 15 });
    await addEvent("System Command: ESP32 manual safe restart initiated...");
    await addEvent("Hardware restarting...");

    setTimeout(async () => {
      await patchDevice({ cpu_usage: 14, memory_usage: 38 });
      await addEvent("Device Booted Success - Firmware v1.2.0");
      const online = await getInternetState();
      if (online) {
        await addEvent("WiFi Network Connected (RuralNet_AM2)");
        await addEvent("Heartbeat established with Cloud server");
      } else {
        await addEvent("WiFi connected but Internet Outage Detected");
      }
    }, 1500);

    const deviceStatus = await getDeviceStatus();
    res.json({ success: true, deviceStatus });
  });

  // ── POST /api/demo/reset ─────────────────────────────────────────────────────
  app.post("/api/demo/reset", async (_req, res) => {
    // Wipe all data
    await supabase.from("orders").delete().neq("id", "___never___");
    await supabase.from("device_events").delete().neq("id", "___never___");
    await supabase.from("sync_logs").delete().neq("id", "___never___");

    // Reset device status to clean defaults
    await patchDevice({
      signal_strength: -64,
      memory_usage: 38,
      cpu_usage: 14,
      uptime: 0,
      status: "ONLINE",
      last_heartbeat: new Date().toISOString(),
      orders_stored_locally: 0,
      orders_synced: 0,
      failed_sync_attempts: 0,
    });

    // Reset network to online
    await supabase.from("app_config").update({ is_internet_available: true }).eq("id", 1);

    res.json({ success: true, message: "All data cleared. Ready for fresh use." });
  });

  // ── Vite / Static ─────────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RuralSync Server (Supabase) running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
