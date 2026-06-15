import { useState, useEffect } from "react";
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
    { name: "Customer Login", description: "Authenticate as Rural Customer", active: false, status: "idle" },
    { name: "Create Order", description: "Submit transaction while online", active: false, status: "idle" },
    { name: "Simulate Outage", description: "Trigger telecommunication link failure", active: false, status: "idle" },
    { name: "ESP32 local buffer", description: "Create order stored offline in LittleFS", active: false, status: "idle" },
    { name: "View Offline Queue", description: "Review buffered order on Edge module", active: false, status: "idle" },
    { name: "Restore connection", description: "Re-establish cellular network link", active: false, status: "idle" },
    { name: "Automatic sync", description: "Edge gateway handshakes and uploads buffer", active: false, status: "idle" },
    { name: "Supplier receives order", description: "Log in as Urban Supplier to view order", active: false, status: "idle" },
    { name: "Supplier accepts order", description: "Review and approve order details", active: false, status: "idle" },
    { name: "Customer receives approval", description: "Order status shifts to Payment Pending", active: false, status: "idle" },
    { name: "Payment completed", description: "Customer pays, simulating checkout flow", active: false, status: "idle" },
    { name: "Order Dispatched", description: "Supplier ships package (In Transit)", active: false, status: "idle" },
    { name: "Delivery Completed", description: "Supplier marks order as Delivered in village", active: false, status: "idle" }
  ]);

  // Notification overlay systems
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: "success" | "info" | "warning"; time: string }[]>([]);

  const addNotification = (message: string, type: "success" | "info" | "warning") => {
    // Toast notifications disabled per user request
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
    }, 4500); // Poll database state every 4.5 seconds
    return () => clearInterval(interval);
  }, []);

  // API Call Triggers
  const addOrder = async (productName: string, quantity: number, retailerName: string, priority: "Low" | "Medium" | "High", proposed = false, notes = "", pricePerUnit = 1500) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, quantity, retailerName, priority, proposed, notes, pricePerUnit })
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
        addNotification(`Order Approved: ${data.order.orderId} status shifted to Payment Pending`, "success");
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

  const payOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/pay`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        addNotification(`Payment Successful: ${data.order.orderId} is now marked as Paid`, "success");
        fetchData();
      }
    } catch (e) {
      console.error("Error paying order:", e);
    }
  };

  const requestPayment = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/request-payment`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        addNotification(`Payment request sent for ${data.order.orderId}`, "success");
        fetchData();
      }
    } catch (e) {
      console.error("Error requesting payment:", e);
    }
  };

  const dispatchOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/dispatch`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        addNotification(`Order Dispatched: ${data.order.orderId} is now In Transit`, "success");
        fetchData();
      }
    } catch (e) {
      console.error("Error dispatching order:", e);
    }
  };

  const deliverOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/deliver`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        addNotification(`Order Delivered: ${data.order.orderId} marked as Delivered`, "success");
        fetchData();
      }
    } catch (e) {
      console.error("Error marking delivered:", e);
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

        if (!available) {
          addNotification("Internet Outage: ESP32 switched to LittleFS local buffer mode", "warning");
        } else {
          // Network restored — server already auto-synced
          const synced: number = data.ordersSynced ?? 0;
          if (synced > 0) {
            addNotification(
              `Network Restored: ESP32 auto-synced ${synced} buffered order(s) to Cloud!`,
              "success"
            );
          } else {
            addNotification("Network Restored: ESP32 online — no buffered orders to sync", "success");
          }
        }
        fetchData();
      }
    } catch (e) {
      console.error("Error toggling network state:", e);
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
      console.error("Error triggering sync:", e);
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
      console.error("Error restarting device:", e);
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
      console.error("Error resetting demo:", e);
    }
  };

  // Full 13-step demonstration sequence
  const runFullDemo = async () => {
    if (demoActive) return;
    setDemoActive(true);
    addNotification("Starting RuralSync Dual-Portal Demonstration Sequence!", "info");

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
      // Step 1: Customer Login
      updateStep(0, "running", true);
      setDemoMessage("Step 1/13: Logging in as Rural Customer...");
      await sleep(2000);
      updateStep(0, "success", false);

      // Step 2: Create Order
      updateStep(1, "running", true);
      setDemoMessage("Step 2/13: Creating order while ONLINE (Rajesh Agri-Retail Co)...");
      const ord1 = await addOrder("Solar Irrigation Pump", 1, "Rajesh Agri-Retail Co", "High", false, "First online order");
      await sleep(2500);
      updateStep(1, "success", false);

      // Step 3: Simulate Outage
      updateStep(2, "running", true);
      setDemoMessage("Step 3/13: Injected telecom outage... Internet connection lost.");
      await toggleNetworkState(false);
      await sleep(2500);
      updateStep(2, "success", false);

      // Step 4: ESP32 local buffer
      updateStep(3, "running", true);
      setDemoMessage("Step 4/13: Creating order while OFFLINE. Buffered offline in LittleFS orders.txt.");
      const ord2 = await addOrder("Soil Humidity Sensor Probe", 4, "Rajesh Agri-Retail Co", "Medium", false, "Offline buffer test");
      await sleep(2500);
      updateStep(3, "success", false);

      // Step 5: View Offline Queue
      updateStep(4, "running", true);
      setDemoMessage("Step 5/13: Viewing buffered orders inside the offline queue explorer...");
      await sleep(2500);
      updateStep(4, "success", false);

      // Step 6: Restore connection
      updateStep(5, "running", true);
      setDemoMessage("Step 6/13: Restoring internet telecom connectivity...");
      await toggleNetworkState(true);
      await sleep(2500);
      updateStep(5, "success", false);

      // Step 7: Automatic sync
      updateStep(6, "running", true);
      setDemoMessage("Step 7/13: Automatic sync handshake established. Uploading buffer queue...");
      await triggerSync();
      await sleep(2500);
      updateStep(6, "success", false);

      // Step 8: Supplier receives order
      updateStep(7, "running", true);
      setDemoMessage("Step 8/13: Order synced! Supplier receives order details on incoming portal...");
      await sleep(2500);
      updateStep(7, "success", false);

      // Fetch latest orders to get reference to the new ones
      let fetchedOrders: Order[] = [];
      const ordersRes = await fetch("/api/orders");
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        fetchedOrders = data.orders;
      }
      const targetOrder = fetchedOrders.find(o => o.productName.includes("Soil Humidity Sensor")) || fetchedOrders[0];

      // Step 9: Supplier accepts order
      updateStep(8, "running", true);
      setDemoMessage(`Step 9/13: Supplier accepts Order ${targetOrder ? targetOrder.orderId : ""}. Status: Payment Pending...`);
      if (targetOrder) {
        await approveOrder(targetOrder.id);
      }
      await sleep(2500);
      updateStep(8, "success", false);

      // Step 10: Customer receives approval
      updateStep(9, "running", true);
      setDemoMessage("Step 10/13: Customer receives approval and payment prompt...");
      await sleep(2500);
      updateStep(9, "success", false);

      // Step 11: Payment completed
      updateStep(10, "running", true);
      setDemoMessage(`Step 11/13: Simulating customer checkout payment. Status shifts to Paid...`);
      if (targetOrder) {
        await payOrder(targetOrder.id);
      }
      await sleep(2500);
      updateStep(10, "success", false);

      // Step 12: Order Dispatched
      updateStep(11, "running", true);
      setDemoMessage(`Step 12/13: Supplier dispatches order in transit...`);
      if (targetOrder) {
        await dispatchOrder(targetOrder.id);
      }
      await sleep(2500);
      updateStep(11, "success", false);

      // Step 13: Delivery Completed
      updateStep(12, "running", true);
      setDemoMessage(`Step 13/13: Order successfully delivered to rural village!`);
      if (targetOrder) {
        await deliverOrder(targetOrder.id);
      }
      await sleep(2500);
      updateStep(12, "success", false);

      addNotification("Demo Complete! End-to-end IoT supply chain reliability verified.", "success");
      setDemoMessage("Demo completed successfully!");
    } catch (err) {
      console.error("Demo sequence error:", err);
      addNotification("Demonstration sequence experienced a runtime error", "warning");
    } finally {
      setDemoActive(false);
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
    payOrder,
    requestPayment,
    dispatchOrder,
    deliverOrder,
    toggleNetworkState,
    triggerSync,
    restartDevice,
    resetDemo,
    runFullDemo,
    addNotification
  };
}
