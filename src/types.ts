export interface Order {
  id: string;
  orderId: string;
  productName: string;
  quantity: number;
  retailerName: string;
  priority: "Low" | "Medium" | "High";
  timestamp: string;
  status:
    | "Created"
    | "Buffered Offline"
    | "Synced"
    | "Approved"
    | "Payment Pending"
    | "Paid"
    | "In Transit"
    | "Delivered"
    | "Proposed"
    | "Failed";
  storageLocation: "Cloud" | "ESP32 Local Buffer";
  notes?: string;
  pricePerUnit?: number;
}

export interface DeviceStatus {
  deviceId: string;
  signalStrength: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
  status: "ONLINE" | "OFFLINE" | "SYNCING" | "DISCONNECTED";
  lastHeartbeat: string;
  ordersStoredLocally: number;
  ordersSynced: number;
  failedSyncAttempts: number;
}

export interface DeviceEvent {
  id: string;
  event: string;
  timestamp: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  ordersSynced: number;
  result: string;
}

export type SidebarTab =
  | "dashboard"
  | "orders"
  | "sync"
  | "monitoring"
  | "control"
  | "analytics"
  | "history"
  | "settings";
