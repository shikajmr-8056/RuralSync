import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Interfaces mimicking Database tables
interface Order {
  id: string;
  orderId: string;
  productName: string;
  quantity: number;
  retailerName: string;
  priority: "Low" | "Medium" | "High";
  timestamp: string;
  status: "Pending" | "Synced" | "Failed" | "Proposed";
  storageLocation: "Cloud" | "ESP32 Local Buffer";
}

interface DeviceStatus {
  deviceId: string;
  signalStrength: number; // dBm
  memoryUsage: number; // percentage
  cpuUsage: number; // percentage
  uptime: number; // seconds
  status: "ONLINE" | "OFFLINE" | "SYNCING" | "DISCONNECTED";
  lastHeartbeat: string;
  ordersStoredLocally: number;
  ordersSynced: number;
  failedSyncAttempts: number;
}

interface DeviceEvent {
  id: string;
  event: string;
  timestamp: string;
}

interface SyncLog {
  id: string;
  timestamp: string;
  ordersSynced: number;
  result: string;
}

// In-Memory Database Storage
let orders: Order[] = [
  {
    id: "ord-1",
    orderId: "RS-1021",
    productName: "Solar Irrigation Pump Controller",
    quantity: 2,
    retailerName: "AgriTech Rural Solutions",
    priority: "High",
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    status: "Synced",
    storageLocation: "Cloud"
  },
  {
    id: "ord-2",
    orderId: "RS-1022",
    productName: "High-Yield Seed Kits (Wheat)",
    quantity: 50,
    retailerName: "Bhoomi Fertilizer Hub",
    priority: "Medium",
    timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
    status: "Synced",
    storageLocation: "Cloud"
  },
  {
    id: "ord-3",
    orderId: "RS-1023",
    productName: "Drip Irrigation Pipe Bundle (100m)",
    quantity: 8,
    retailerName: "GreenValley Co-operative",
    priority: "Low",
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    status: "Synced",
    storageLocation: "Cloud"
  },
  {
    id: "ord-4",
    orderId: "RS-1024",
    productName: "LoRa 915MHz Gateway Module",
    quantity: 1,
    retailerName: "Krishna Kalyan Bhandar",
    priority: "High",
    timestamp: new Date(Date.now() - 3600000 * 5.5).toISOString(),
    status: "Synced",
    storageLocation: "Cloud"
  },
  {
    id: "ord-5",
    orderId: "RS-1025",
    productName: "Organic Super-Phosphate (25kg)",
    quantity: 20,
    retailerName: "Maa Durga Fertilisers",
    priority: "Medium",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: "Synced",
    storageLocation: "Cloud"
  },
  {
    id: "ord-6",
    orderId: "RS-1026",
    productName: "Off-Grid Deep Cycle Battery 200Ah",
    quantity: 3,
    retailerName: "Agrikart Cooperative",
    priority: "High",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: "Synced",
    storageLocation: "Cloud"
  },
  {
    id: "ord-7",
    orderId: "RS-1027",
    productName: "Smart Ferti-Meter v3 Probe",
    quantity: 5,
    retailerName: "Farms Depot",
    priority: "Low",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: "Synced",
    storageLocation: "Cloud"
  },
  {
    id: "ord-8",
    orderId: "RS-1028",
    productName: "E-Paper Retail Label Tags (Pack of 10)",
    quantity: 4,
    retailerName: "Balaji Agrotech Co-op",
    priority: "Low",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "Synced",
    storageLocation: "Cloud"
  },
  {
    id: "ord-9",
    orderId: "RS-1029",
    productName: "Soil Moisture Sensors v2.1",
    quantity: 12,
    retailerName: "Ram Prasad Fertilisers",
    priority: "Medium",
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    status: "Pending",
    storageLocation: "ESP32 Local Buffer"
  },
  {
    id: "ord-10",
    orderId: "RS-1030",
    productName: "Smart Drip-Irrig V2 Controller",
    quantity: 1,
    retailerName: "Karan Agri-Services Ltd",
    priority: "High",
    timestamp: new Date(Date.now() - 3600000 * 0.25).toISOString(),
    status: "Proposed",
    storageLocation: "ESP32 Local Buffer"
  }
];

let deviceStatus: DeviceStatus = {
  deviceId: "ESP32-RuralSync-001",
  signalStrength: -64, // dBm
  memoryUsage: 38, // 38% used of 320KB
  cpuUsage: 14,
  uptime: 4850, // seconds
  status: "ONLINE",
  lastHeartbeat: new Date().toISOString(),
  ordersStoredLocally: 2,
  ordersSynced: 8,
  failedSyncAttempts: 0
};

let deviceEvents: DeviceEvent[] = [
  {
    id: "evt-1",
    event: "Device Booted Success - Firmware v1.2.0",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "evt-2",
    event: "WiFi Network Connected (RuralNet_AM2)",
    timestamp: new Date(Date.now() - 3600000 * 3.9).toISOString()
  },
  {
    id: "evt-3",
    event: "Heartbeat Established with Cloud Server",
    timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString()
  },
  {
    id: "evt-4",
    event: "Initial Sync Completed: 3 historically verified",
    timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString()
  }
];

let syncLogs: SyncLog[] = [
  {
    id: "sync-1",
    timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    ordersSynced: 3,
    result: "Success: Verified and migrated to Cloud"
  }
];

// Global simulation control
let isInternetAvailable = true;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log middeleware helper
  const addEvent = (msg: string) => {
    const newEvent: DeviceEvent = {
      id: "evt-" + Math.random().toString(36).substring(2, 9),
      event: msg,
      timestamp: new Date().toISOString()
    };
    deviceEvents.unshift(newEvent);
    // limit to 100 max
    if (deviceEvents.length > 100) deviceEvents.pop();
    return newEvent;
  };

  // Helper to add order
  const createNewOrder = (productName: string, quantity: number, retailerName: string, priority: "Low" | "Medium" | "High", proposed = false) => {
    const orderIndex = orders.length + 1;
    const orderId = `RS-${1020 + orderIndex}`;
    const id = "ord-" + Math.random().toString(36).substring(2, 9);
    
    // Check our internet state to see where order should be stored
    let status: "Pending" | "Synced" | "Failed" | "Proposed" = isInternetAvailable ? "Synced" : "Pending";
    let storageLocation: "Cloud" | "ESP32 Local Buffer" = isInternetAvailable ? "Cloud" : "ESP32 Local Buffer";
    
    if (proposed) {
      status = "Proposed";
      storageLocation = "ESP32 Local Buffer";
    }

    const newOrder: Order = {
      id,
      orderId,
      productName,
      quantity,
      retailerName,
      priority,
      timestamp: new Date().toISOString(),
      status,
      storageLocation
    };

    orders.unshift(newOrder);

    if (proposed) {
      addEvent(`Order Proposal Created: ${orderId} (${productName}) from edge, awaiting merchant approval`);
    } else if (!isInternetAvailable) {
      deviceStatus.ordersStoredLocally += 1;
      addEvent(`Order Buffered: ${orderId} (${productName}) stored in LittleFS /orders.txt`);
    } else {
      deviceStatus.ordersSynced += 1;
      addEvent(`Order Synced: ${orderId} (${productName}) uploaded directly to Cloud database`);
    }

    return newOrder;
  };

  // API ROUTES

  // Get all orders
  app.get("/api/orders", (req, res) => {
    res.json({ orders });
  });

  // Create new order
  app.post("/api/orders", (req, res) => {
    const { productName, quantity, retailerName, priority, proposed } = req.body;
    if (!productName || !quantity || !retailerName || !priority) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const order = createNewOrder(productName, Number(quantity), retailerName, priority, !!proposed);
    res.json({ order, deviceStatus });
  });

  // Approve a proposed order
  app.post("/api/orders/:id/approve", (req, res) => {
    const { id } = req.params;
    const order = orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    order.status = "Synced";
    order.storageLocation = "Cloud";
    
    // Update stats and add log
    deviceStatus.ordersSynced += 1;
    addEvent(`Order Proposal Approved: ${order.orderId} (${order.productName}) accepted by merchant`);
    
    res.json({ success: true, order, deviceStatus });
  });

  // Reject a proposed order
  app.post("/api/orders/:id/reject", (req, res) => {
    const { id } = req.params;
    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    const order = orders[orderIndex];
    orders.splice(orderIndex, 1);
    
    addEvent(`Order Proposal Rejected: ${order.orderId} (${order.productName}) declined by merchant`);
    
    res.json({ success: true, deviceStatus });
  });

  // Get current device status
  app.get("/api/device/status", (req, res) => {
    // Increment uptime in a simple simulated way
    deviceStatus.uptime += 10;
    // Jitter signal and CPU a little
    if (deviceStatus.status === "ONLINE") {
      deviceStatus.signalStrength = -60 - Math.floor(Math.random() * 10);
      deviceStatus.cpuUsage = 10 + Math.floor(Math.random() * 10);
    } else if (deviceStatus.status === "OFFLINE") {
      deviceStatus.signalStrength = -110; // complete drop
      deviceStatus.cpuUsage = 4 + Math.floor(Math.random() * 5); // idling
    }
    deviceStatus.lastHeartbeat = new Date().toISOString();
    res.json(deviceStatus);
  });

  // Post device status update (simulated ESP32 reporting)
  app.post("/api/device/status", (req, res) => {
    const { status, signalStrength, memoryUsage, cpuUsage, uptime, ordersStoredLocally } = req.body;
    
    if (status) deviceStatus.status = status;
    if (signalStrength !== undefined) deviceStatus.signalStrength = signalStrength;
    if (memoryUsage !== undefined) deviceStatus.memoryUsage = memoryUsage;
    if (cpuUsage !== undefined) deviceStatus.cpuUsage = cpuUsage;
    if (uptime !== undefined) deviceStatus.uptime = uptime;
    if (ordersStoredLocally !== undefined) deviceStatus.ordersStoredLocally = ordersStoredLocally;
    
    deviceStatus.lastHeartbeat = new Date().toISOString();
    res.json({ message: "Status updated successfully", deviceStatus });
  });

  // Get device events
  app.get("/api/device/events", (req, res) => {
    res.json({ events: deviceEvents });
  });

  // Post new device event
  app.post("/api/device/events", (req, res) => {
    const { event } = req.body;
    if (!event) {
      return res.status(400).json({ error: 'Missing "event" field' });
    }
    const evt = addEvent(event);
    res.json({ success: true, event: evt });
  });

  // Get synchronization history logs
  app.get("/api/sync/history", (req, res) => {
    res.json({ syncLogs });
  });

  // Get network simulation connection status
  app.get("/api/network-status", (req, res) => {
    res.json({ isInternetAvailable });
  });

  // Change network state (toggle internet)
  app.post("/api/network-status", (req, res) => {
    const { available } = req.body;
    if (available === undefined) {
      return res.status(400).json({ error: "Missing available boolean field" });
    }
    isInternetAvailable = available;
    
    if (isInternetAvailable) {
      deviceStatus.status = "ONLINE";
      addEvent("WiFi Connected - Internet Restored");
    } else {
      deviceStatus.status = "OFFLINE";
      addEvent("WiFi Connected but Internet Outage Detected");
    }
    
    res.json({ isInternetAvailable, deviceStatus });
  });

  // Trigger synchronization / Force Sync
  app.post("/api/sync", (req, res) => {
    if (!isInternetAvailable) {
      deviceStatus.failedSyncAttempts += 1;
      addEvent("Sync Attempt Failed: No cloud connectivity");
      return res.status(400).json({ 
        error: "Sync Failed: Cloud backend is currently unreachable from Edge Gateway." 
      });
    }

    const pendingOrders = orders.filter(o => o.status === "Pending");
    const count = pendingOrders.length;
    
    if (count === 0) {
      return res.json({ 
        message: "No orders to synchronize.", 
        ordersSynced: 0,
        deviceStatus 
      });
    }

    deviceStatus.status = "SYNCING";
    addEvent(`Synchronization Started: Scanning LittleFS queue containing ${count} buffer files...`);

    // Simulate database conversion to cloud
    pendingOrders.forEach(o => {
      o.status = "Synced";
      o.storageLocation = "Cloud";
    });

    deviceStatus.ordersStoredLocally = 0;
    deviceStatus.ordersSynced += count;
    deviceStatus.status = "ONLINE";

    // Add event log
    addEvent(`Synchronization Completed: Uploaded ${count} orders successfully. LittleFS buffer cleared.`);

    // Add sync log
    const newLog: SyncLog = {
      id: "sync-" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      ordersSynced: count,
      result: `Success: Transferred ${count} pending orders to cloud.`
    };
    syncLogs.unshift(newLog);

    res.json({ 
      success: true, 
      ordersSynced: count, 
      deviceStatus, 
      syncLogs 
    });
  });

  // Restart Device
  app.post("/api/device/restart", (req, res) => {
    deviceStatus.uptime = 0;
    deviceStatus.cpuUsage = 95; // peak load on startup
    deviceStatus.memoryUsage = 15; // low usage before buffers/heap fragmenting
    
    addEvent("System Command: ESP32 manual safe restart initiated...");
    addEvent("Hardware restarting...");
    
    setTimeout(() => {
      deviceStatus.cpuUsage = 14;
      deviceStatus.memoryUsage = 38;
      addEvent("Device Booted Success - Firmware v1.2.0");
      if (isInternetAvailable) {
        addEvent("WiFi Network Connected (RuralNet_AM2)");
        addEvent("Heartbeat established with Cloud server");
      } else {
        addEvent("WiFi connected but Internet Outage Detected");
      }
    }, 1500);

    res.json({ success: true, deviceStatus });
  });

  // Reset demo databases back to initial state
  app.post("/api/demo/reset", (req, res) => {
    orders = [
      {
        id: "ord-1",
        orderId: "RS-1021",
        productName: "Solar Irrigation Pump Controller",
        quantity: 2,
        retailerName: "AgriTech Rural Solutions",
        priority: "High",
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        status: "Synced",
        storageLocation: "Cloud"
      },
      {
        id: "ord-2",
        orderId: "RS-1022",
        productName: "High-Yield Seed Kits (Wheat)",
        quantity: 50,
        retailerName: "Bhoomi Fertilizer Hub",
        priority: "Medium",
        timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
        status: "Synced",
        storageLocation: "Cloud"
      },
      {
        id: "ord-3",
        orderId: "RS-1023",
        productName: "Drip Irrigation Pipe Bundle (100m)",
        quantity: 8,
        retailerName: "GreenValley Co-operative",
        priority: "Low",
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        status: "Synced",
        storageLocation: "Cloud"
      },
      {
        id: "ord-4",
        orderId: "RS-1024",
        productName: "LoRa 915MHz Gateway Module",
        quantity: 1,
        retailerName: "Krishna Kalyan Bhandar",
        priority: "High",
        timestamp: new Date(Date.now() - 3600000 * 5.5).toISOString(),
        status: "Synced",
        storageLocation: "Cloud"
      },
      {
        id: "ord-5",
        orderId: "RS-1025",
        productName: "Organic Super-Phosphate (25kg)",
        quantity: 20,
        retailerName: "Maa Durga Fertilisers",
        priority: "Medium",
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        status: "Synced",
        storageLocation: "Cloud"
      },
      {
        id: "ord-6",
        orderId: "RS-1026",
        productName: "Off-Grid Deep Cycle Battery 200Ah",
        quantity: 3,
        retailerName: "Agrikart Cooperative",
        priority: "High",
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: "Synced",
        storageLocation: "Cloud"
      },
      {
        id: "ord-7",
        orderId: "RS-1027",
        productName: "Smart Ferti-Meter v3 Probe",
        quantity: 5,
        retailerName: "Farms Depot",
        priority: "Low",
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        status: "Synced",
        storageLocation: "Cloud"
      },
      {
        id: "ord-8",
        orderId: "RS-1028",
        productName: "E-Paper Retail Label Tags (Pack of 10)",
        quantity: 4,
        retailerName: "Balaji Agrotech Co-op",
        priority: "Low",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: "Synced",
        storageLocation: "Cloud"
      },
      {
        id: "ord-9",
        orderId: "RS-1029",
        productName: "Soil Moisture Sensors v2.1",
        quantity: 12,
        retailerName: "Ram Prasad Fertilisers",
        priority: "Medium",
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        status: "Pending",
        storageLocation: "ESP32 Local Buffer"
      },
      {
        id: "ord-10",
        orderId: "RS-1030",
        productName: "Smart Drip-Irrig V2 Controller",
        quantity: 1,
        retailerName: "Karan Agri-Services Ltd",
        priority: "High",
        timestamp: new Date(Date.now() - 3600000 * 0.25).toISOString(),
        status: "Proposed",
        storageLocation: "ESP32 Local Buffer"
      }
    ];

    deviceStatus = {
      deviceId: "ESP32-RuralSync-001",
      signalStrength: -65,
      memoryUsage: 38,
      cpuUsage: 12,
      uptime: 4850,
      status: "ONLINE",
      lastHeartbeat: new Date().toISOString(),
      ordersStoredLocally: 2,
      ordersSynced: 8,
      failedSyncAttempts: 0
    };

    deviceEvents = [
      {
        id: "evt-1",
        event: "Device Reset To Default Configuration",
        timestamp: new Date().toISOString()
      },
      {
        id: "evt-2",
        event: "Initial Sync Completed: All records clean",
        timestamp: new Date().toISOString()
      }
    ];

    syncLogs = [
      {
        id: "sync-init",
        timestamp: new Date().toISOString(),
        ordersSynced: 3,
        result: "Demo Database initialized successfully"
      }
    ];

    isInternetAvailable = true;

    res.json({ success: true, message: "Demo reset to default state" });
  });

  // Serve Vite app client-side SPA
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // PORT bindings as required
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RuralSync Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
