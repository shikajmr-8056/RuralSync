import React, { useState } from "react";
import {
  Cpu,
  Wifi,
  WifiOff,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  PlusCircle,
  Layers,
  Database,
  BarChart3,
  ListOrdered,
  Activity,
  History,
  Settings as SettingsIcon,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  X,
  Server
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRuralSync, DemoStep } from "./useRuralSync";
import ESP32Mockup from "./components/ESP32Mockup";
import { SidebarTab, Order } from "./types";

export default function App() {
  const {
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
  } = useRuralSync();

  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
  const [settingsSubTab, setSettingsSubTab] = useState<"general" | "esp32">("general");
  const [copiedCode, setCopiedCode] = useState(false);
  const [orderForm, setOrderForm] = useState({
    productName: "",
    quantity: 1,
    retailerName: "",
    priority: "Medium" as "Low" | "Medium" | "High"
  });

  // Filter & Search state for Orders Page
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Synced">("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | "Low" | "Medium" | "High">("All");

  // Local state for user confirmation triggers
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Common products for quick fill in form
  const sampleProducts = [
    { name: "Solar Irrigation Controller V2", prefix: "Agtech" },
    { name: "LittleFS Expansion SD Module", prefix: "IoT-Edge" },
    { name: "Soil Humidity Multi-Probe", prefix: "Sensor" },
    { name: "High-Yield Wheat Seed Case", prefix: "BioCorp" },
    { name: "Off-Grid Deep Cycle Battery v4", prefix: "SolarIsle" },
    { name: "E-Paper Retail Label Tag", prefix: "EdgeSign" }
  ];

  // Quick order submission handler
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.productName || !orderForm.retailerName) {
      addNotification("Please fill in all order properties", "warning");
      return;
    }
    setIsSubmitLoading(true);
    await addOrder(
      orderForm.productName,
      orderForm.quantity,
      orderForm.retailerName,
      orderForm.priority
    );
    setIsSubmitLoading(false);
    // Reset form partially for consecutive additions
    setOrderForm(prev => ({
      ...prev,
      productName: "",
      quantity: 1
    }));
  };

  const fillQuickOrder = (name: string) => {
    setOrderForm(prev => ({
      ...prev,
      productName: name,
      retailerName: prev.retailerName || "Balaji Agrotech Co-op"
    }));
  };

  // Hardware click simulator
  const handleHardwareGPIONode = async () => {
    const products = ["ESP32 Probe Node", "Smart Flowmeter", "Autonomous Seed Injector", "LoRa Retail Node"];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const retailers = ["Anand Farms Store", "Devi Agri-Supply Ltd", "Sai Baba Agro", "Himalayan Co-op"];
    const randomRetailer = retailers[Math.floor(Math.random() * retailers.length)];
    const priorities: ("Low" | "Medium" | "High")[] = ["Low", "Medium", "High"];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    
    addNotification("ESP32 GPIO 12 Tactile Click Registering...", "info");
    await addOrder(randomProduct, 1, randomRetailer, randomPriority, true);
  };

  // Filtered orders list for table view
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.retailerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;
    
    const matchesPriority =
      priorityFilter === "All" || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate high-level statistics
  const totalOrdersCount = orders.length;
  const syncedOrdersCount = orders.filter(o => o.status === "Synced").length;
  const pendingOrdersCount = orders.filter(o => o.status === "Pending").length;
  const ordersOnESP32 = orders.filter(o => o.storageLocation === "ESP32 Local Buffer").length;
  const uptimeSuccess = isInternetAvailable ? "98.4%" : "0.0%";

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden relative">
      
      {/* Absolute Ambient Glass Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-950/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[35%] h-[35%] rounded-full bg-purple-900/5 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="flex w-full min-h-screen relative z-10">
        
        {/* Left Sidebar Menu */}
        <aside className="w-72 shrink-0 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/60 p-6 flex flex-col justify-between">
          <div>
            {/* Logo area */}
            <div className="flex items-center gap-3.5 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold font-display shadow-lg shadow-blue-500/20">
                ⚡
              </div>
              <div>
                <span className="text-xs text-blue-400 font-mono font-bold tracking-widest leading-none block">EDGE COMPUTING</span>
                <h1 className="text-xl font-bold font-display tracking-tight text-white leading-tight">
                  RuralSync
                </h1>
              </div>
            </div>

            {/* Navigation links */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block px-3 mb-2.5">
                Core Workspace
              </span>

              {[
                { id: "dashboard", label: "Dashboard", icon: Layers },
                { id: "orders", label: "Orders Queue", icon: ListOrdered, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
                { id: "sync", label: "Synchronization Center", icon: RefreshCw },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SidebarTab)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-blue-600/10 text-blue-400 font-medium border border-blue-500/20 shadow-md shadow-blue-900/5"
                        : "text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                      <span>{tab.label}</span>
                    </span>
                    {tab.badge && (
                      <span className="bg-amber-400 text-slate-950 font-bold font-mono text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block px-3 pt-5 mb-2.5">
                IoT Edge System
              </span>

              {[
                { id: "monitoring", label: "ESP32 Device Monitor", icon: Cpu },
                { id: "control", label: "IoT Control Center", icon: Smartphone },
                { id: "analytics", label: "Analytics Suite", icon: BarChart3 },
                { id: "history", label: "Sync History Logs", icon: History },
                { id: "settings", label: "System Setup", icon: SettingsIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SidebarTab)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-blue-600/10 text-blue-400 font-medium border border-blue-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                      <span>{tab.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick ESP32 Status Card on Bottom Left */}
          <div className="space-y-4 pt-6 border-t border-slate-800/60">
            <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Signal & Latency
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isInternetAvailable
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                      : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  }`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-mono">
                  {deviceStatus ? deviceStatus.deviceId : "ESP32-RuralSync"}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded">
                  {isInternetAvailable ? "52ms" : "Offline"}
                </span>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Buffer Pool</span>
                <span className="text-amber-400 font-bold font-mono">
                  {pendingOrdersCount} orders waiting
                </span>
              </div>
            </div>

            {/* Small Footer metadata */}
            <div className="text-[10px] text-slate-500 text-center font-mono leading-relaxed">
              RuralSync Edge Platform v1.2.0<br/>
              Safe Fail-Safe Protocol Enabled
            </div>
          </div>
        </aside>

        {/* Root content view */}
        <main className="flex-1 flex flex-col min-h-screen bg-slate-950 relative overflow-y-auto">
          
          {/* Top Navbar Header */}
          <header className="h-20 border-b border-slate-900/80 bg-slate-950/40 backdrop-blur-md shrink-0 flex items-center justify-between px-8 z-20">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest select-none">
                {activeTab.toUpperCase()} FRAMEWORK
              </span>
              <div className="h-4 w-px bg-slate-800" />
              <div
                className={`text-[11px] px-3 py-1 rounded-full font-bold border flex items-center gap-2 select-none ${
                  isInternetAvailable
                    ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10"
                    : "text-red-400 bg-red-500/5 border-red-500/10"
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>
                  {isInternetAvailable
                    ? "CLOUD ENDPOINT ONLINE • STABLE"
                    : "OUTAGE PROTOCOL INJECTED • LOCAL STORAGE ONLY"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Reset Database and Demo trigger quick controls */}
              <button
                onClick={resetDemo}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-all text-slate-400"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                Reset Demo DB
              </button>

              <button
                onClick={runFullDemo}
                disabled={demoActive}
                className={`bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-blue-900/30 font-display tracking-wide flex items-center gap-2 transition-all ${
                  demoActive ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {demoActive ? "Sequence Running..." : "Run Competition Demo"}
              </button>
            </div>
          </header>

          {/* Project Objective Banner */}
          <div className="bg-gradient-to-r from-blue-950/40 via-slate-900/40 to-slate-950 border-b border-slate-900 px-8 py-3.5 text-xs text-blue-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded font-mono font-bold uppercase text-[9px]">
                MISSION
              </span>
              <p className="italic">
                "Enabling reliable retail operations in rural areas through ESP32-powered offline-first order management and automatic synchronization."
              </p>
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0 select-none">
              IoT Entry #4829
            </div>
          </div>

          <div className="flex-1 p-8 space-y-8 z-10 max-w-7xl w-full mx-auto">
            
            {/* KPI grid panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl">
                <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-medium">
                  Total Orders Created
                </span>
                <p className="text-3xl font-display font-bold mt-1.5 text-white">
                  {totalOrdersCount}
                </p>
                <div className="mt-2.5 text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                  <span>● Active DB Instances</span>
                </div>
              </div>

              <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl">
                <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-medium">
                  Synced to Cloud
                </span>
                <p className="text-3xl font-display font-medium mt-1.5 text-emerald-400">
                  {syncedOrdersCount}
                </p>
                <div className="mt-2.5 text-[10px] text-slate-400 font-bold uppercase">
                  Storage location = Cloud
                </div>
              </div>

              <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl">
                <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-medium animate-pulse">
                  Unsynced Pending Queue
                </span>
                <p className={`text-3xl font-display font-semibold mt-1.5 ${pendingOrdersCount > 0 ? "text-amber-400 font-bold animate-bounce" : "text-slate-500"}`}>
                  {pendingOrdersCount}
                </p>
                <div className="mt-2.5 text-[10px] text-amber-500/90 font-bold uppercase">
                  {pendingOrdersCount > 0 ? "Awaiting network link" : "Clear: Buffer synchronized"}
                </div>
              </div>

              <div className="bg-blue-600 p-5 rounded-2xl shadow-xl shadow-blue-900/20 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-8 -translate-y-8 blur-lg" />
                <span className="text-[11px] text-blue-100 uppercase tracking-widest block font-medium">
                  ESP32 LittleFS Allocation
                </span>
                <p className="text-3xl font-display font-bold mt-1.5">
                  {ordersOnESP32}
                </p>
                <span className="mt-2.5 text-[10px] text-blue-200 uppercase font-mono block">
                  File: /littlefs/orders.txt
                </span>
              </div>
            </div>

            {/* Active Demo Steps Banner */}
            <AnimatePresence>
              {demoActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-900/80 rounded-2xl p-5 border border-blue-500/20"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <span className="text-xs text-blue-400 font-bold flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      AUTOMATED COMPETITION DEMONSTRATION IN PROGRESS
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Step Timer Running
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium text-slate-200 mb-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    ⚡ {demoMessage}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {demoSteps.map((step, idx) => (
                      <div
                        key={step.name}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          step.status === "running"
                            ? "bg-blue-600/20 border-blue-500 shadow-md text-white animate-pulse"
                            : step.status === "success"
                            ? "bg-emerald-600/5 border-emerald-500/30 text-emerald-400"
                            : "bg-slate-950/40 border-slate-800/80 text-slate-500"
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 font-mono block mb-1">
                          0{idx + 1}. {step.name}
                        </span>
                        <p className="text-[9px] leading-relaxed line-clamp-2">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Split Screen Dashboard View */}
            <AnimatePresence mode="wait">
              
              {/* TAB 1: DASHBOARD MAIN */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="tab-dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {/* Left Column: ESP32 Hardware Status and Quick Actions */}
                  <div className="col-span-1 space-y-6">
                    <ESP32Mockup
                      status={deviceStatus || {
                        deviceId: "ESP32-RuralSync-001",
                        signalStrength: -65,
                        memoryUsage: 38,
                        cpuUsage: 12,
                        uptime: 4850,
                        status: "ONLINE",
                        lastHeartbeat: new Date().toISOString(),
                        ordersStoredLocally: 0,
                        ordersSynced: 3,
                        failedSyncAttempts: 0
                      }}
                      events={events}
                      orders={orders}
                      isInternetAvailable={isInternetAvailable}
                      onRestart={restartDevice}
                      onHardwareButtonOrder={handleHardwareGPIONode}
                    />

                    {/* Quick Simulation Board */}
                    <div className="bg-slate-900/20 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                          Hardware Jitter Tool
                        </h3>
                        <span className="text-[11px] text-blue-400 font-mono">Edge Control</span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Outage Injector State:</span>
                          <span className={`font-mono ${isInternetAvailable ? "text-emerald-400" : "text-red-400"}`}>
                            {isInternetAvailable ? "INTERNET_UP" : "INTERNET_OUTAGE"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => toggleNetworkState(false)}
                            className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold py-2 rounded-xl transition-all cursor-pointer"
                          >
                            Kill Internet
                          </button>
                          <button
                            onClick={() => toggleNetworkState(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-2 rounded-xl transition-all cursor-pointer"
                          >
                            Restore Internet
                          </button>
                        </div>
                        <button
                          onClick={triggerSync}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl border border-slate-700/60 transition-all font-display text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Initiate Cloud Synchronization
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Active Order Stream and Dynamic Statistics */}
                  <div className="col-span-2 space-y-6">
                    {/* Compact Add Order quick Form */}
                    <div className="bg-slate-900/10 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80">
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-850">
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-display">
                          Fast Merchant Terminal
                        </h3>
                        <span className="text-xs bg-blue-950 text-blue-400 px-2.5 py-0.5 rounded font-mono">
                          GPIO 04 Map
                        </span>
                      </div>

                      <form onSubmit={handleOrderSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                              Retailer Shop Name
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Anand Rural Cooperatives"
                              value={orderForm.retailerName}
                              onChange={(e) => setOrderForm(prev => ({ ...prev, retailerName: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                              Order Item Product Descr
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Solar Pump Inverter Kit"
                              value={orderForm.productName}
                              onChange={(e) => setOrderForm(prev => ({ ...prev, productName: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                              Quantity Pack Count
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="1000"
                              required
                              value={orderForm.quantity}
                              onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                              Order Delivery Priority
                            </label>
                            <select
                              value={orderForm.priority}
                              onChange={(e) => setOrderForm(prev => ({ ...prev, priority: e.target.value as "Low" | "Medium" | "High" }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                        </div>

                        {/* Quick suggestions to save typing */}
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[9px] text-slate-500 font-mono flex items-center pt-1 pr-1">Q-Stock:</span>
                          {sampleProducts.map((p) => (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => fillQuickOrder(p.name)}
                              className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded transition-colors border border-slate-800"
                            >
                              + {p.name}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <p className="text-[10px] text-slate-400 max-w-sm">
                            <span className="text-amber-500 font-bold">INFO:</span> If Internet falls offline, this submission is routed instantly to LittleFS partition and marked <span className="bg-amber-400 text-slate-950 px-1 rounded text-[9px] font-bold">Pending</span>.
                          </p>
                          <button
                            type="submit"
                            disabled={isSubmitLoading}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-blue-900/30 cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4" />
                            {isSubmitLoading ? "Saving..." : "Create Order"}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Active queues and Activity streams log */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Active Live Activity Feed */}
                      <div className="bg-slate-900/10 backdrop-blur-md rounded-3xl p-5 border border-slate-800/80 flex flex-col h-[320px]">
                        <div className="flex items-center justify-between mb-4 shrink-0 border-b border-slate-850 pb-2">
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-400" />
                            Live Activity Feed
                          </span>
                          <span className="text-[9px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono animate-pulse">
                            STREAM LOGS
                          </span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
                          {events.length === 0 ? (
                            <p className="text-xs text-slate-500 text-center py-10 italic">
                              Listening for hardware status events...
                            </p>
                          ) : (
                            events.slice(0, 10).map((evt) => {
                              // Match styling depending on keywords
                              const text = evt.event.toLowerCase();
                              let colorClass = "bg-blue-500";
                              if (text.includes("lost") || text.includes("outage") || text.includes("fail")) {
                                colorClass = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
                              } else if (text.includes("restored") || text.includes("completed") || text.includes("booted") || text.includes("success")) {
                                colorClass = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
                              } else if (text.includes("buffered") || text.includes("restart")) {
                                colorClass = "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]";
                              }

                              return (
                                <div key={evt.id} className="flex gap-3 text-xs">
                                  <div className="w-px bg-slate-800 relative left-1.5 my-1 shrink-0">
                                    <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${colorClass}`} />
                                  </div>
                                  <div className="pl-3.5">
                                    <p className="font-semibold text-slate-200 leading-snug">{evt.event}</p>
                                    <p className="text-[9px] text-slate-400 mt-0.5 font-mono">
                                      {new Date(evt.timestamp).toLocaleTimeString()} • Signal: -64dBm
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Quick Orders List Snapshot */}
                      <div className="bg-slate-900/10 backdrop-blur-md rounded-3xl p-5 border border-slate-800/80 flex flex-col h-[320px]">
                        <div className="flex items-center justify-between mb-4 shrink-0 border-b border-slate-850 pb-2">
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                            <ListOrdered className="w-4 h-4 text-emerald-400" />
                            Live Orders Queue
                          </span>
                          <button
                            onClick={() => setActiveTab("orders")}
                            className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            Detailed Queue <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                          {orders.slice(0, 5).map((order) => (
                            <div
                              key={order.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                                order.status === "Pending"
                                  ? "bg-amber-500/5 border-amber-500/20"
                                  : "bg-slate-950/60 border-slate-800/80"
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                                    {order.orderId}
                                  </span>
                                  <span className="font-semibold text-slate-200 text-xs truncate max-w-[120px]">
                                    {order.productName}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                                  {order.retailerName} (Qty: {order.quantity})
                                </span>
                              </div>
                              <div className="text-right shrink-0">
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${
                                    order.status === "Pending"
                                      ? "bg-amber-400/10 text-amber-400 border border-amber-500/15"
                                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                                  }`}
                                >
                                  {order.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: DETAILED ORDERS QUEUE */}
              {activeTab === "orders" && (
                <motion.div
                  key="tab-orders"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-900/10 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-850">
                      <div>
                        <h3 className="text-lg font-bold font-display text-white">
                          Retailer Orders Queue Database
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Browse, filter, and track status parameters of system transactions.
                        </p>
                      </div>

                      {/* Filters and search toggles */}
                      <div className="flex flex-wrap gap-2">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search Order, Retailer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
                          />
                        </div>

                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value as "All" | "Pending" | "Synced")}
                          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Synced">Synced</option>
                          <option value="Pending">Pending Buffer</option>
                        </select>

                        <select
                          value={priorityFilter}
                          onChange={(e) => setPriorityFilter(e.target.value as "All" | "Low" | "Medium" | "High")}
                          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="All">All Priorities</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto rounded-xl border border-slate-850">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900/60 text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-800">
                            <th className="px-5 py-3 font-semibold text-center w-20">No.</th>
                            <th className="px-5 py-3 font-semibold">Order ID</th>
                            <th className="px-5 py-3 font-semibold">Product Name</th>
                            <th className="px-5 py-3 font-semibold">Retailer Name</th>
                            <th className="px-5 py-3 font-semibold text-center">Qty</th>
                            <th className="px-5 py-3 font-semibold">Priority</th>
                            <th className="px-5 py-3 font-semibold">Timestamp</th>
                            <th className="px-5 py-3 font-semibold text-center">Status</th>
                            <th className="px-5 py-3 font-semibold text-right">Storage node</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-slate-850">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="text-center py-10 italic text-slate-500 font-sans">
                                No records match search state or filter configuration.
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map((order, idx) => {
                              const isPending = order.status === "Pending";
                              const isProposed = order.status === "Proposed";
                              return (
                                <tr
                                  key={order.id}
                                  className={`hover:bg-slate-900/40 transition-colors ${
                                    isPending ? "bg-amber-400/[0.01]" :
                                    isProposed ? "bg-orange-500/[0.02]" : ""
                                  }`}
                                >
                                  <td className="px-5 py-4 text-center text-slate-500 font-mono text-[10px]">
                                    {idx + 1}
                                  </td>
                                  <td className="px-5 py-4 font-mono font-bold text-slate-200">
                                    {order.orderId}
                                  </td>
                                  <td className="px-5 py-4 font-semibold text-slate-100">
                                    {order.productName}
                                  </td>
                                  <td className="px-5 py-4 text-slate-300">
                                    {order.retailerName}
                                  </td>
                                  <td className="px-5 py-4 text-center font-mono text-slate-300">
                                    {order.quantity}
                                  </td>
                                  <td className="px-5 py-4">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                                        order.priority === "High"
                                          ? "bg-red-500/10 text-red-400"
                                          : order.priority === "Medium"
                                          ? "bg-blue-500/15 text-blue-300"
                                          : "bg-slate-800 text-slate-400"
                                      }`}
                                    >
                                      {order.priority}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-slate-400 font-mono text-[10px]">
                                    {new Date(order.timestamp).toLocaleString()}
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    <span
                                      className={`px-2 py-1 rounded-full font-bold text-[9px] tracking-wide inline-block ${
                                        isPending
                                          ? "bg-amber-400 text-slate-950 font-black animate-pulse"
                                          : isProposed
                                          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      }`}
                                    >
                                      {order.status.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <span
                                      className={`font-mono text-[11px] font-bold tracking-wide uppercase ${
                                        order.storageLocation === "Cloud"
                                          ? "text-blue-400"
                                          : "text-amber-400 italic"
                                      }`}
                                    >
                                      {order.storageLocation}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: SYNCHRONIZATION CENTER */}
              {activeTab === "sync" && (
                <motion.div
                  key="tab-sync"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-900/10 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80">
                    <div className="pb-4 mb-5 border-b border-slate-850">
                      <h3 className="text-lg font-bold font-display text-white">
                        ESP32 Synchronization Engine
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Configure connection failover constraints, buffer uploads, and handshake policies.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                            <Database className="w-4 h-4 text-blue-400" />
                            Transmission Pool
                          </span>
                          <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono">
                            QUEUED STATES
                          </span>
                        </div>

                        <div className="text-center py-6">
                          <span className="text-5xl font-bold text-amber-400 font-display block">
                            {pendingOrdersCount}
                          </span>
                          <span className="text-xs text-slate-400 mt-1.5 block font-mono">
                            Pending Orders inside Local Buffer
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Auto Sync Protocol Status:</span>
                            <span className="text-emerald-400 font-bold font-mono">Active (10s Cycle)</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Last Synchronization Time:</span>
                            <span className="text-slate-200 font-mono">
                              {syncLogs[0] ? new Date(syncLogs[0].timestamp).toLocaleTimeString() : "No history"}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Next Scheduled Attempt:</span>
                            <span className="text-slate-400 font-mono">In ~5.5s (Poller active)</span>
                          </div>
                        </div>

                        <button
                          onClick={triggerSync}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-900/30"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Initiate Out-Of-Cycle Synced Upload
                        </button>
                      </div>

                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-900 mb-4">
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                              Protocol Log Information
                            </span>
                            <span className="text-[10px] text-amber-500 font-bold uppercase">
                              Failover Guard
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-400 leading-relaxed">
                            When outages are captured, the edge device's hardware halts immediate TCP uploads and switches storage routing to LittleFS. When internet availability returns, the device utilizes an automated heartbeat protocol to re-establish secure handshakes and clear buffers.
                          </p>

                          <div className="mt-4 p-3.5 bg-slate-900/50 rounded-xl border border-slate-800/80 text-[11px] space-y-1.5 text-slate-300 font-mono">
                            <div>✔ 1. State detector poll latency: &lt;100ms</div>
                            <div>✔ 2. Flash Sector write speed: ~150KB/s</div>
                            <div>✔ 3. Auto handshake backoff timeout: 5s</div>
                            <div>✔ 4. Transport Payload Encryption: TLS v1.3</div>
                          </div>
                        </div>

                        <div className="pt-4 text-xs text-slate-400 italic">
                          "Durable local storage combined with automated cloud uploading enables resilient offline systems."
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: ESP32 DEVICE MONITORING */}
              {activeTab === "monitoring" && (
                <motion.div
                  key="tab-monitoring"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-900/10 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80">
                    <div className="pb-4 mb-5 border-b border-slate-850 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold font-display text-white">
                          Hardware Edge Node Diagnostics
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Receive real-time telemetry metrics directly from the SoC registers.
                        </p>
                      </div>
                      <span className="bg-blue-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded shadow">
                        COMM PORT: COM 4
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Telemetry card 1 */}
                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">MCU Uptime</span>
                          <Clock className="w-4 h-4 text-slate-500" />
                        </div>
                        <p className="text-2xl font-mono text-white font-bold">
                          {deviceStatus ? `${deviceStatus.uptime}s` : "4850s"}
                        </p>
                        <div className="pt-2 border-t border-slate-900 text-slate-400 text-[10px] font-mono">
                          Auto Heartbeat Interval: Every 10s
                        </div>
                      </div>

                      {/* Telemetry card 2 */}
                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Memory Allocation</span>
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-2xl font-mono text-white font-bold">
                          {deviceStatus ? `${deviceStatus.memoryUsage}%` : "38%"}
                        </p>
                        <div className="pt-2 border-t border-slate-900 text-[10px] text-amber-400 font-mono flex justify-between">
                          <span>Partition Type: LittleFS</span>
                          <span>Heap: 184KB Free</span>
                        </div>
                      </div>

                      {/* Telemetry card 3 */}
                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Firmware Build Target</span>
                          <Cpu className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-2xl font-display text-white font-medium">
                          ESP32 v1.2.0-STABLE
                        </p>
                        <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                          Compiler: ESP-IDF v5.1 with LittleFS API
                        </div>
                      </div>

                    </div>

                    <div className="mt-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                        State Machine Status Trace
                      </h4>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
                          <span className="text-slate-400 block mb-1">RSSI Core:</span>
                          <span className="font-bold text-white">
                            {isInternetAvailable ? "-64 dBm (Excellent)" : "-110 dBm (Outage Cut)"}
                          </span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
                          <span className="text-slate-400 block mb-1">Device Status State:</span>
                          <span className="font-bold text-emerald-400">{deviceStatus?.status || "ONLINE"}</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
                          <span className="text-slate-400 block mb-1">Buffered Flash Count:</span>
                          <span className="font-bold text-amber-300">{pendingOrdersCount} files</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
                          <span className="text-slate-400 block mb-1">Failed Handshakes:</span>
                          <span className="font-bold text-red-400">{deviceStatus?.failedSyncAttempts || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: IOT CONTROL CENTER */}
              {activeTab === "control" && (
                <motion.div
                  key="tab-control"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-900/10 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80">
                    <div className="pb-4 mb-5 border-b border-slate-850">
                      <h3 className="text-lg font-bold font-display text-white">
                        IoT Edge Sandbox & Simulation Controls
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Utilize these controls to inspect failover edge behavior during hardware engineering evaluation.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Demonstration Injector panel */}
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-1.5">
                            Telecom Outage Simulation
                          </span>
                          <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            Simulate cutting or re-establishing physical fiber / cellular towers in rural regions to inspect backup queue storage transitions in real time.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={() => toggleNetworkState(false)}
                            className="w-full bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white font-bold py-2 px-3 rounded-xl text-xs transition-all border border-red-500/20 cursor-pointer"
                          >
                            Simulate Internet Outage
                          </button>
                          <button
                            onClick={() => toggleNetworkState(true)}
                            className="w-full bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold py-2 px-3 rounded-xl text-xs transition-all border border-emerald-500/20 cursor-pointer"
                          >
                            Restore Internet Link
                          </button>
                        </div>
                      </div>

                      {/* GPIO 12 Button creation */}
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-1.5">
                            Tactile GPIO Order Clicker
                          </span>
                          <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            Creates a demo order mimicking a merchant pressing a physical push-button hooked directly into the ESP32’s GPIO pin 12.
                          </p>
                        </div>

                        <button
                          onClick={handleHardwareGPIONode}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold py-3 px-3 rounded-xl text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4 text-amber-400" />
                          Simulate Hard Press GPIO 12
                        </button>
                      </div>

                      {/* Reset Chip trigger */}
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-1.5">
                            System Safe Restart EN Button
                          </span>
                          <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            Triggers a chip powercycle event. Clearing active processing states, re-initializing registers, and checking LittleFS directory mappings.
                          </p>
                        </div>

                        <button
                          onClick={restartDevice}
                          className="w-full bg-slate-900 hover:bg-red-900/20 text-red-400 font-bold py-3 px-3 rounded-xl text-xs border border-slate-800 hover:border-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4 text-red-500" />
                          Simulate Hardware Safe Restart
                        </button>
                      </div>

                    </div>

                    {/* Integrated step indicator guide */}
                    <div className="mt-8 bg-slate-950/40 p-5 rounded-2xl border border-slate-800">
                      <span className="text-xs font-bold text-slate-300 uppercase block mb-3">
                        Competition Judge Instructions
                      </span>
                      <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside leading-relaxed">
                        <li>Toggle <span className="text-white font-semibold">Simulate Internet Outage</span>. Dashboard alert state immediately updates to represent telecommunications cutoff.</li>
                        <li>Create a few orders via the merchant terminal input or pressing <span className="text-white font-semibold">GPIO 12 Tactile Click</span>.</li>
                        <li>Explore the <span className="text-amber-400 font-semibold font-mono">/littlefs/orders.txt</span> file viewer on the ESP32 overlay board to confirm partition storage.</li>
                        <li>Restore connectivity. Automatic handshake protocol begins upload immediately without requiring manual sync triggers!</li>
                      </ol>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 6: ANALYTICS SUITE */}
              {activeTab === "analytics" && (
                <motion.div
                  key="tab-analytics"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-900/10 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80">
                    <div className="pb-4 mb-5 border-b border-slate-850">
                      <h3 className="text-lg font-bold font-display text-white">
                        Performance Analytics Dashboard
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        High-precision custom SVG charts analyzing packet delivery rates, queue trends, and network reliability stats.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Chart 1: Order Buffer Intake */}
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                              Order Synced Trends (Daily)
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Accumulated Sales Volumes</span>
                          </div>
                          <span className="text-emerald-400 text-xs font-bold font-mono">+12.5%</span>
                        </div>

                        {/* Interactive SVG bar chart */}
                        <div className="h-44 w-full flex items-end justify-between pt-4 pb-2 border-b border-slate-800 px-2">
                          {[
                            { label: "Mon", val: 40 },
                            { label: "Tue", val: 55 },
                            { label: "Wed", val: 32 },
                            { label: "Thu", val: 84 },
                            { label: "Fri", val: 68 },
                            { label: "Sat", val: 95 },
                            { label: "Sun", val: 120 }
                          ].map((bar) => (
                            <div key={bar.label} className="flex flex-col items-center gap-2 flex-1 group">
                              <div className="w-8 bg-blue-600/20 hover:bg-blue-600 rounded-t-md transition-all duration-300 relative" style={{ height: `${(bar.val / 120) * 110}px` }}>
                                <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 bg-slate-800 text-white font-mono text-[9px] py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  {bar.val} items
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">{bar.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Chart 2: Outage & Connectivity failures */}
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                              Outage & Sync Success Rate
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Last 7 Calendar Days</span>
                          </div>
                          <span className="text-blue-400 text-xs font-bold font-mono">98.4%</span>
                        </div>

                        {/* Line dynamic graph SVG representation */}
                        <div className="h-44 w-full relative pt-4 flex items-end">
                          <svg className="w-full h-32 text-blue-500" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                              </linearGradient>
                            </defs>
                            <path
                              d="M 0 25 Q 15 20, 30 22 T 60 10 T 90 2 T 100 5 L 100 30 L 0 30 Z"
                              fill="url(#chartGradient)"
                            />
                            <path
                              d="M 0 25 Q 15 20, 30 22 T 60 10 T 90 2 T 100 5"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="1.2"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col justify-between text-[9px] text-slate-600 font-mono pointer-events-none">
                            <div>99.9% Reliable</div>
                            <div className="border-t border-slate-900 border-dashed w-full" />
                            <div>90.0% Guard Limit</div>
                            <div className="border-t border-slate-900 border-dashed w-full" />
                            <div>80.0% Critical</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-3.5 pt-2 border-t border-slate-900">
                          <span>06/08</span>
                          <span>06/10</span>
                          <span>06/12</span>
                          <span>Today (June 14)</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 7: SYNC HISTORY LOGS */}
              {activeTab === "history" && (
                <motion.div
                  key="tab-history"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-900/10 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80">
                    <div className="pb-4 mb-5 border-b border-slate-850">
                      <h3 className="text-lg font-bold font-display text-white">
                        Synchronisation Ledger Mappings
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Cryptographic ledger of synchronization transactions converted from edge gateways since initial boot.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      {syncLogs.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-10 italic">
                          No historic sync files registered. Run a synchronization session to generate logs.
                        </p>
                      ) : (
                        syncLogs.map((log) => (
                          <div
                            key={log.id}
                            className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 shrink-0">
                                <ShieldCheck className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-mono text-xs font-bold text-slate-200">
                                  ID Tag: {log.id}
                                </span>
                                <p className="text-xs text-slate-400 mt-1">
                                  {log.result}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                                +{log.ordersSynced} SYNCED
                              </span>
                              <p className="text-[10px] text-slate-500 font-mono mt-1.5">
                                {new Date(log.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 8: SYSTEM SETTINGS */}
              {activeTab === "settings" && (
                <motion.div
                  key="tab-settings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-900/10 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80">
                    <div className="pb-4 mb-5 border-b border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold font-display text-white">
                          System Configuration Panel
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Control hardware parameters, simulation states, or export production ESP32 firmware.
                        </p>
                      </div>

                      {/* Sub-tab controllers */}
                      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 self-start shrink-0">
                        <button
                          onClick={() => setSettingsSubTab("general")}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                            settingsSubTab === "general"
                              ? "bg-blue-600 text-white shadow"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          General Configuration
                        </button>
                        <button
                          onClick={() => setSettingsSubTab("esp32")}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                            settingsSubTab === "esp32"
                              ? "bg-blue-600 text-white shadow"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          ESP32 C++ Code
                        </button>
                      </div>
                    </div>

                    {settingsSubTab === "general" ? (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Option 1 */}
                          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                            <label className="text-xs font-bold text-slate-300 block">
                              Heartbeat Polling Interval (Milli-seconds)
                            </label>
                            <input
                              type="number"
                              defaultValue="10000"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-500 leading-normal">
                              Frequencies of the POST heartbeats sent to the server. Lower values represent real-time updates but increment CPU workloads on low RAM nodes.
                            </p>
                          </div>

                          {/* Option 2 */}
                          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                            <label className="text-xs font-bold text-slate-300 block">
                              Backup storage Flash Partition Type
                            </label>
                            <select className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white cursor-pointer focus:outline-none">
                              <option>LittleFS Flash Sector Mapping (Preferred)</option>
                              <option>FatFS SD Card Array Partition</option>
                              <option>EEPROM Direct Byte Map (No partition)</option>
                            </select>
                            <p className="text-[10px] text-slate-500 leading-normal">
                              Choose between partition schemas for storing failover text objects. LittleFS ensures wear-leveling algorithms on modern ESP32 flash matrices.
                            </p>
                          </div>

                        </div>

                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 space-y-4">
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                            Critical Engineering Maintenance Controls
                          </h4>
                          <div className="flex gap-4">
                            <button
                              onClick={resetDemo}
                              className="bg-red-950 hover:bg-red-900/40 text-red-400 border border-red-500/25 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                            >
                              Erase Flash / Zero Out Database Mocks
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            WARNING: Erases all order tables and resets mock device trace state back to manufacturing initial parameters.
                          </p>
                        </div>

                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-blue-950/20 border border-blue-500/20 p-5 rounded-2xl text-blue-300 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] px-2 py-0.5 bg-blue-900/40 border border-blue-500/30 rounded-full font-bold">
                              RECOMMENDED DEMO CONFIGURATION
                            </span>
                            <span className="font-mono text-[10px] px-2 py-0.5 bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 rounded-full font-bold">
                              JUDGE-PROOF
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold font-display">Demonstrating Unshakable Failover to Competition Judges</h4>
                          <p className="text-xs leading-relaxed text-slate-300 font-sans">
                            This C++ sketch compiles inside <strong className="text-white">Arduino IDE</strong> or VS Code PlatformIO. It runs on any standard ESP32 development board. To show true physical failover, hook up a standard tactile button to <strong className="text-white">GPIO 12</strong> (pulls down to Ground). 
                            Turn off your phone hotspot or router WiFi. Press the button to buffer orders offline in LittleFS. Re-enable WiFi, and the device will automatically synchronize to this live terminal within 10 seconds!
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            File: ESP32_RuralSync.ino (Saved in Root Workspace)
                          </span>
                          <button
                            onClick={() => {
                              const targetUrl = window.location.origin;
                              const fullArduinoSketsh = `/*
 * RuralSync - ESP32 Offline-First Edge Gateway Firmware
 * Developed for Engineering Innovation Competition
 * 
 * Hardware Requirements:
 * - ESP32 Development Board (e.g., ESP32-WROOM-32E)
 * - I2C SSD1306 128x64 OLED Display (SDA=GPIO 21, SCL=GPIO 22)
 * - Physical Push Button connected to GPIO 12 (with internal PULLUP)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <LittleFS.h>
#include <ArduinoJson.h>

const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const String SERVER_URL  = "${targetUrl}/"; 

#define BUTTON_PIN      12 
#define OLED_RESET      -1 
#define SCREEN_ADDRESS  0x3C 

Adafruit_SSD1306 display(128, 64, &Wire, OLED_RESET);

enum SystemState { STATE_BOOT, STATE_ONLINE, STATE_OFFLINE, STATE_SYNCING };
SystemState currentState = STATE_BOOT;

unsigned long lastHeartbeatTime = 0;
const unsigned long HEARTBEAT_INTERVAL = 10000;
unsigned long lastButtonPress = 0;
const unsigned long DEBOUNCE_DELAY = 300;

String deviceId = "ESP32-RuralSync-001";
int localBufferCount = 0;
int successfulSyncs = 0;

void drawWiFiIcon(bool connected) {
  if (connected) {
    display.drawCircle(115, 8, 8, SSD1306_WHITE);
    display.drawCircle(115, 8, 4, SSD1306_WHITE);
    display.fillCircle(115, 8, 1, SSD1306_WHITE);
  } else {
    display.drawLine(107, 0, 123, 16, SSD1306_WHITE);
    display.drawLine(123, 0, 107, 16, SSD1306_WHITE);
  }
}

void updateOLED(const String& line1, const String& line2, const String& line3) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,0);
  display.print("RuralSync ");
  display.print(deviceId.substring(16));
  
  drawWiFiIcon(currentState == STATE_ONLINE || currentState == STATE_SYNCING);
  display.drawLine(0, 12, 127, 12, SSD1306_WHITE);

  display.setCursor(0, 18);
  display.print("ST: ");
  if (currentState == STATE_ONLINE) display.print("ONLINE (Cloud)");
  else if (currentState == STATE_OFFLINE) display.print("OFFLINE (LittleFS)");
  else if (currentState == STATE_SYNCING) display.print("SYNCING...");
  else display.print("BOOTING...");

  display.setCursor(0, 32); display.print(line1);
  display.setCursor(0, 44); display.print(line2);
  display.setCursor(0, 56); display.print("Buff: " + String(localBufferCount) + " | Synced: " + String(successfulSyncs));
  display.display();
}

void recountLocalBuffer() {
  if (!LittleFS.exists("/orders.txt")) { localBufferCount = 0; return; }
  File file = LittleFS.open("/orders.txt", "r");
  if (!file) { localBufferCount = 0; return; }
  int count = 0;
  while (file.available()) {
    String line = file.readStringUntil('\\n');
    if (line.length() > 5) count++;
  }
  file.close();
  localBufferCount = count;
}

void logEventToCloud(String message) {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.begin(SERVER_URL + "api/device/events");
  http.addHeader("Content-Type", "application/json");
  StaticJsonDocument<200> doc;
  doc["event"] = message;
  String req; serializeJson(doc, req);
  http.POST(req);
  http.end();
}

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) {
    currentState = STATE_OFFLINE; recountLocalBuffer();
    updateOLED("WiFi Lost", "Hotspot offline", "Buffering locally");
    return;
  }
  HTTPClient http;
  http.begin(SERVER_URL + "api/device/status");
  http.addHeader("Content-Type", "application/json");
  StaticJsonDocument<250> doc;
  doc["deviceId"] = deviceId;
  doc["status"] = (currentState == STATE_ONLINE) ? "ONLINE" : "SYNCING";
  doc["signalStrength"] = WiFi.RSSI();
  doc["memoryUsage"] = 38;
  doc["cpuUsage"] = 15;
  doc["uptime"] = millis() / 1000;
  doc["ordersStoredLocally"] = localBufferCount;
  String req; serializeJson(doc, req);
  int code = http.POST(req);
  if (code > 0) { currentState = STATE_ONLINE; recountLocalBuffer(); }
  else { currentState = STATE_OFFLINE; }
  http.end();
}

void bufferOrderLocally(String product, String retailer, String priority) {
  File file = LittleFS.open("/orders.txt", "a");
  if (!file) { updateOLED("FS Error", "LittleFS mount fail", "Check flash map"); return; }
  file.print(product); file.print(","); file.print(retailer); file.print(","); file.println(priority);
  file.close();
  recountLocalBuffer();
  updateOLED("Buffered locally!", "Cached in LittleFS", "/orders.txt appended");
}

bool uploadOrder(String product, String retailer, String priority) {
  if (WiFi.status() != WL_CONNECTED) return false;
  HTTPClient http;
  http.begin(SERVER_URL + "api/orders");
  http.addHeader("Content-Type", "application/json");
  StaticJsonDocument<250> doc;
  doc["productName"] = product;
  doc["quantity"] = 1;
  doc["retailerName"] = retailer;
  doc["priority"] = priority;
  String req; serializeJson(doc, req);
  int httpCode = http.POST(req);
  http.end();
  return (httpCode == 200 || httpCode == 201);
}

void synchronizeBuffer() {
  if (localBufferCount == 0) return;
  currentState = STATE_SYNCING;
  updateOLED("Restored Wifi!", "Syncing cache...", "Uploading LittleFS");
  logEventToCloud("Synchronization Started: ESP32 automatic upload initiated");

  File file = LittleFS.open("/orders.txt", "r");
  if (!file) { currentState = STATE_ONLINE; return; }
  std::vector<String> lines;
  while (file.available()) {
    String line = file.readStringUntil('\\n');
    if (line.length() > 5) lines.push_back(line);
  }
  file.close();

  int successCount = 0;
  for (size_t i = 0; i < lines.size(); i++) {
    String currentLine = lines[i];
    int firstComma = currentLine.indexOf(',');
    int secondComma = currentLine.indexOf(',', firstComma + 1);
    
    if (firstComma != -1 && secondComma != -1) {
      String productName = currentLine.substring(0, firstComma);
      String retailer = currentLine.substring(firstComma + 1, secondComma);
      String priority = currentLine.substring(secondComma + 1);
      priority.trim();
      
      if (uploadOrder(productName, retailer, priority)) {
        successCount++; successfulSyncs++;
        delay(200);
      }
    }
  }

  LittleFS.remove("/orders.txt");
  recountLocalBuffer();
  updateOLED("Sync Success!", "Uploaded " + String(successCount) + " orders", "Local flash cleared");
  delay(1500);
  currentState = STATE_ONLINE;
  logEventToCloud("Synchronization Completed: " + String(successCount) + " orders migrated");
  sendHeartbeat();
}

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) { for(;;); }
  display.clearDisplay();
  updateOLED("Booting...", "Loading LittleFS", "Waiting on wifi...");
  if (!LittleFS.begin(true)) { return; }
  recountLocalBuffer();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int counter = 0;
  while (WiFi.status() != WL_CONNECTED && counter < 15) { delay(500); counter++; }

  if (WiFi.status() == WL_CONNECTED) {
    currentState = STATE_ONLINE;
    logEventToCloud("Device Booted Success - Firmware v1.2.0");
    sendHeartbeat();
  } else {
    currentState = STATE_OFFLINE;
  }
  updateOLED("System Ready", "Press Pin 12 Button", "To submit order");
}

void loop() {
  unsigned long currentMillis = millis();
  if (currentMillis - lastHeartbeatTime >= HEARTBEAT_INTERVAL) {
    lastHeartbeatTime = currentMillis;
    if (WiFi.status() == WL_CONNECTED && currentState == STATE_OFFLINE) {
      synchronizeBuffer();
    } else {
      sendHeartbeat();
    }
  }

  if (digitalRead(BUTTON_PIN) == LOW) {
    if (currentMillis - lastButtonPress > DEBOUNCE_DELAY) {
      lastButtonPress = currentMillis;
      String products[] = {"Smart Drip-Irrig V2", "Fibre Backhaul Link", "Off-Grid Battery Hub", "Soil Probe Sensor"};
      String prod = products[random(0, 4)];
      if (WiFi.status() == WL_CONNECTED && currentState == STATE_ONLINE) {
        if (uploadOrder(prod, "Cooperatives", "High")) {
          successfulSyncs++;
          updateOLED("Order Sent!", prod, "Uploaded direct");
        } else {
          bufferOrderLocally(prod, "Cooperatives", "High");
        }
      } else {
        bufferOrderLocally(prod, "Cooperatives", "High");
      }
    }
  }
}`;
                              navigator.clipboard.writeText(fullArduinoSketsh);
                              setCopiedCode(true);
                              addNotification("ESP32 Arduino Sketch copied! Ready to flash.", "success");
                              setTimeout(() => setCopiedCode(false), 2000);
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedCode ? "Copied Sketch!" : "Copy Full C++ sketch"}
                          </button>
                        </div>

                        <div className="bg-slate-950 rounded-2xl border border-slate-850 p-5 font-mono text-[11px] leading-relaxed text-slate-300 h-96 overflow-y-auto overflow-x-auto relative">
                          <pre className="whitespace-pre">
{`#include <WiFi.h>
#include <HTTPClient.h>
#include <LittleFS.h>
#include <ArduinoJson.h>

const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const String SERVER_URL  = "${window.location.origin}/"; // Auto-configured backend server URL!

#define BUTTON_PIN      12 // Push button pulls GPIO 12 to GND on press
#define OLED_SDA        21 
#define OLED_SCL        22

// Automatically tracks local buffering on LittleFS system when Internet goes offline,
// and auto-uploads the accumulated orders once connection returns.`}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
            
          </div>

          {/* Bottom Diagnostics Footer */}
          <footer className="h-14 border-t border-slate-900/80 bg-slate-950/60 backdrop-blur-md shrink-0 flex items-center justify-between px-8 text-xs text-slate-500 select-none z-10">
            <div className="flex gap-6">
              <span>Device status: <span className="text-slate-300 font-mono">ONLINE</span></span>
              <span>Memory Heap: <span className="text-slate-300">184KB Free</span></span>
              <span>Signal Quality: <span className="text-slate-300 font-mono">{isInternetAvailable ? "-64 dBm" : "Disconnected"}</span></span>
            </div>
            <div className="text-[10px] text-blue-500 uppercase tracking-wider font-bold italic">
              ENGINEERING INNOVATION COMPETITION ENTRY • IoT RETALLING CATEGORY
            </div>
          </footer>
        </main>
      </div>

      {/* Real-time Toast Notifications stack bottom right with animation */}
      <div className="fixed bottom-6 right-6 space-y-2.5 z-50 max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.slice(0, 4).map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`p-4 rounded-xl shadow-2xl backdrop-blur-md border text-xs pointer-events-auto flex gap-3 ${
                toast.type === "success"
                  ? "bg-slate-900/90 border-emerald-500/30 text-emerald-300"
                  : toast.type === "warning"
                  ? "bg-slate-900/90 border-amber-500/30 text-amber-300"
                  : "bg-slate-900/90 border-blue-500/30 text-blue-300"
              }`}
            >
              <div className="flex-1">
                <span className="text-[9px] text-slate-500 block mb-0.5 font-mono">
                  {toast.time} SYSTEM NOTIFICATION
                </span>
                <p className="font-medium text-slate-100">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Proposed Order Approval Dialog Modal */}
      <AnimatePresence>
        {orders.some(o => o.status === "Proposed") && (
          (() => {
            const proposed = orders.find(o => o.status === "Proposed")!;
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
                >
                  <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-slate-850">
                    <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 font-bold shadow-lg">
                      ⚠️
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-400 font-mono font-bold tracking-widest block">ORDER REQUEST</span>
                      <h2 className="text-lg font-bold text-white leading-tight">
                        Approval Required
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                    A physical push button click or simulation trigger was received from the **ESP32 Edge Gateway**. Please review the details of the proposed order:
                  </p>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6 space-y-3 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Proposal ID:</span>
                      <span className="text-slate-300 font-bold">{proposed.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Product Name:</span>
                      <span className="text-slate-100 font-bold">{proposed.productName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Retailer:</span>
                      <span className="text-slate-300 font-bold">{proposed.retailerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Quantity:</span>
                      <span className="text-slate-300">{proposed.quantity} unit(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Priority:</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        proposed.priority === "High" ? "bg-red-500/10 text-red-400" :
                        proposed.priority === "Medium" ? "bg-amber-500/10 text-amber-400" :
                        "bg-blue-500/10 text-blue-400"
                      }`}>
                        {proposed.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gateway Source:</span>
                      <span className="text-slate-400">GPIO_12_BUTTON</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => rejectOrder(proposed.id)}
                      className="bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center"
                    >
                      Decline Order
                    </button>
                    <button
                      onClick={() => approveOrder(proposed.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center shadow-lg shadow-emerald-900/30"
                    >
                      Accept Order
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()
        )}
      </AnimatePresence>

    </div>
  );
}
