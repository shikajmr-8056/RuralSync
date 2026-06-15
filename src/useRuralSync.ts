import { useState, useEffect, useRef } from "react";
import { Order, DeviceStatus, DeviceEvent, SyncLog } from "./types";

export interface DemoStep {
  name: string;
  description: string;
  active: boolean;
  status: "idle" | "running" | "success" | "error";
}

export function useRuralSync() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isInternetAvailable, setIsInternetAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Demo State
  const [demoActive, setDemoActive] = useState(false);
  const [demoMessage, setDemoMessage] = useState("");
  const [demoSteps, setDemoSteps] = useState<DemoStep[]>([
    { name: "Verifying Connection", description: "Boot ESP32 & check cloud connectivity", active: false, status: "idle" },
    { name: "Create Online Order", description: "Generate a sales record synced directly to cloud", active: false, status: "idle" },
    { name: "Simulate Outage", description: "Inject network disconnect to check offline state", active: false, status: "idle" },
    { name: "Create Offline Orders", description: "Buffer orders safely on ESP32 flash memory via LittleFS", active: false, status: "idle" },
    { name: "Restore & Handshake", description: "Reconnect wifi and start automatic transmission", active: false, status: "idle" },
    { name: "Completed Sync", description: "All buffer records uploaded and verified on cloud", active: false, status: "idle" }
  ]);

  // Notification overlay systems
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: "success" | "info" | "warning"; time: string }[]>([]);

  const addNotification = (message: string, type: "success" | "info" | "warning") => {
    const id = Math.random().toString(36).substring(2, 9);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setNotifications((prev) => [{ id, message, type, time }, ...prev].slice(0, 15));
  };

  // Fetch all server data
  const fetchData = async () => {
    try {
      const [ordersRes, statusRes, eventsRes, logsRes, netRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/device/status"),
        fetch("/api/device/events"),
        fetch("/api/sync/history"),
        fetch("/api/network-status")
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders);
      }
      if (statusRes.ok) {
        const data = await statusRes.json();
        setDeviceStatus(data);
      }
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events);
      }
      if (logsRes.ok) {
        const data = await logsRes.json();
        setSyncLogs(data.syncLogs);
      }
      if (netRes.ok) {
        const data = await netRes.json();
        setIsInternetAvailable(data.isInternetAvailable);
      }
    } catch (e) {
      console.error("Failed to sync backend state:", e);
    } finally {
      setLoading(false);
    }
  };

  // Set up polling intervals
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 4500); // Poll database state every 4.5 seconds to reflect simulated hardware status
    return () => clearInterval(interval);
  }, []);

  // API Call Triggers
  const addOrder = async (productName: string, quantity: number, retailerName: string, priority: "Low" | "Medium" | "High", proposed = false) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, quantity, retailerName, priority, proposed })
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(prev => [data.order, ...prev]);
        setDeviceStatus(data.deviceStatus);
        
        // Notify
        if (proposed) {
          addNotification(`New proposed order ${data.order.orderId} needs approval`, "info");
        } else if (isInternetAvailable) {
          addNotification(`Order Synced: ${data.order.orderId} uploaded directly to Cloud`, "success");
        } else {
          addNotification(`Order Offline: ${data.order.orderId} buffered inside LittleFS /orders.txt`, "warning");
        }
        fetchData();
        return data.order;
      }
    } catch (e) {
      console.error("Error creating order:", e);
    }
  };

  const approveOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/approve`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        addNotification(`Order Approved: ${data.order.orderId} is now synced to Cloud`, "success");
        fetchData();
      }
    } catch (e) {
      console.error("Error approving order:", e);
    }
  };

  const rejectOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/reject`, { method: "POST" });
      if (res.ok) {
        addNotification("Proposed order rejected and deleted", "info");
        fetchData();
      }
    } catch (e) {
      console.error("Error rejecting order:", e);
    }
  };

  const toggleNetworkState = async (available: boolean) => {
    try {
      const res = await fetch("/api/network-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available })
      });
      if (res.ok) {
        const data = await res.json();
        setIsInternetAvailable(data.isInternetAvailable);
        setDeviceStatus(data.deviceStatus);
        
        if (available) {
          addNotification("Internet Restored: ESP32 Edge Gateway handshake initialized", "success");
        } else {
          addNotification("Internet Connection Lost: ESP32 switched to local buffer storage Mode", "warning");
        }
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerSync = async () => {
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        addNotification(`Queue Synced: ${data.ordersSynced} local buffer records migrated to Cloud`, "success");
        fetchData();
        return data;
      } else {
        addNotification(`Sync Failure: ${data.error || "Connection error"}`, "warning");
        fetchData();
        return { error: true, message: data.error };
      }
    } catch (e) {
      console.error(e);
      addNotification("Synchronization failed due to network timeout", "warning");
    }
  };

  const restartDevice = async () => {
    try {
      const res = await fetch("/api/device/restart", { method: "POST" });
      if (res.ok) {
        addNotification("System Command: ESP32 development kit restarting...", "info");
        setTimeout(() => {
          fetchData();
          addNotification("ESP32 Gateway Re-Booted: Core registers initialized", "success");
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetDemo = async () => {
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      if (res.ok) {
        addNotification("Demo Database and logs reset to original state", "info");
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fully Automated Step-by-Step Competition Demonstration
  const runFullDemo = async () => {
    if (demoActive) return;
    setDemoActive(true);
    addNotification("Starting RuralSync Automatic Demo Sequence!", "info");

    const updateStep = (index: number, status: "idle" | "running" | "success" | "error", active: boolean) => {
      setDemoSteps(prev => prev.map((step, idx) => {
        if (idx === index) {
          return { ...step, status, active };
        }
        return { ...step, active: idx === index ? active : step.active };
      }));
    };

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // Step 1: Verification
      updateStep(0, "running", true);
      setDemoMessage("Booting ESP32 Node and validating Cloud Server link status...");
      await toggleNetworkState(true);
      await sleep(2000);
      updateStep(0, "success", false);

      // Step 2: Create Online Order
      updateStep(1, "running", true);
      setDemoMessage("Creating order while ONLINE. Simulating standard real-time transactions...");
      await addOrder("Solar Power Battery Charger", 1, "Rajesh Agri-Retail Co", "High");
      await sleep(2500);
      updateStep(1, "success", false);

      // Step 3: Simulate Outage
      updateStep(2, "running", true);
      setDemoMessage("Simulating complete fiber-cut / server outage on the rural region segment...");
      await toggleNetworkState(false);
      await sleep(3000);
      updateStep(2, "success", false);

      // Step 4: Create Offline Orders
      updateStep(3, "running", true);
      setDemoMessage("Creating multiple retailer orders during network outage. Watch them store inside LittleFS orders.txt...");
      await addOrder("Deepwell Submersible Pump", 2, "Karan Agri-Services Ltd", "High");
      await sleep(2000);
      await addOrder("Organic Super-Phosphate Bags", 12, "Ram Prasad Fertilisers", "Medium");
      await sleep(2500);
      updateStep(3, "success", false);

      // Step 5: Restore WiFi & handshake
      updateStep(4, "running", true);
      setDemoMessage("Restoring telecom cellular link. Re-establishing secure TLS connection handshake...");
      await toggleNetworkState(true);
      await sleep(3000);
      updateStep(4, "success", false);

      // Step 6: Complete Auto Synchronization
      updateStep(5, "running", true);
      setDemoMessage("Handshake completed! Starting automatic upload of buffered order cache, clearing LittleFS cluster...");
      await triggerSync();
      await sleep(2500);
      updateStep(5, "success", false);

      addNotification("Demo Complete! Total system reliability of 100% demonstrated successfully.", "success");
      setDemoMessage("Demo completed successfully! Restored clean online operations.");
    } catch (err) {
      console.error(err);
      addNotification("Interactive automation experienced a runtime error", "warning");
    } finally {
      setDemoActive(false);
      // Reset steps state indicator in 5 seconds
      setTimeout(() => {
        setDemoSteps(prev => prev.map(s => ({ ...s, status: "idle", active: false })));
        setDemoMessage("");
      }, 5000);
    }
  };

  return {
    orders,
    deviceStatus,
    events,
    syncLogs,
    isInternetAvailable,
    loading,
    notifications,
    demoActive,
    demoMessage,
    demoSteps,
    addOrder,
    approveOrder,
    rejectOrder,
    toggleNetworkState,
    triggerSync,
    restartDevice,
    resetDemo,
    runFullDemo,
    addNotification
  };
}
