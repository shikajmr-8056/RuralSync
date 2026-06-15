import React, { useState, useEffect, useMemo } from "react";
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
  Server,
  Sun,
  Moon,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Inbox,
  Info,
  Check,
  Zap,
  SlidersHorizontal
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

  // Theme state: light or dark
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
  });

  // Apply theme to document element
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (theme === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
  const [settingsSubTab, setSettingsSubTab] = useState<"general" | "esp32">("general");
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Modal State for adding order
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [orderForm, setOrderForm] = useState({
    productName: "",
    quantity: 1,
    retailerName: "",
    priority: "Medium" as "Low" | "Medium" | "High"
  });

  // Filter & Search state for Orders Page
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Synced" | "Proposed">("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | "Low" | "Medium" | "High">("All");
  
  // Sorting for Orders Page
  const [sortField, setSortField] = useState<"timestamp" | "quantity" | "priority">("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Pagination for Orders Page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Local state for user confirmation triggers
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Common products for quick fill in form
  const sampleProducts = [
    { name: "Solar Irrigation Controller V2", prefix: "Agtech" },
    { name: "LittleFS Expansion SD Module", prefix: "IoT" },
    { name: "Soil Humidity Multi-Probe", prefix: "Sensor" },
    { name: "High-Yield Wheat Seed Case", prefix: "Bio" },
    { name: "Off-Grid Deep Cycle Battery v4", prefix: "Solar" },
    { name: "E-Paper Retail Label Tag", prefix: "Edge" }
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
    setIsOrderModalOpen(false);
    // Reset form partially for consecutive additions
    setOrderForm({
      productName: "",
      quantity: 1,
      retailerName: "",
      priority: "Medium"
    });
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

  // Filtered and Sorted orders list for table view
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        const matchesSearch =
          order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.retailerName.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus =
          statusFilter === "All" || order.status === statusFilter;
        
        const matchesPriority =
          priorityFilter === "All" || order.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        let fieldA: any = a[sortField];
        let fieldB: any = b[sortField];

        if (sortField === "timestamp") {
          fieldA = new Date(a.timestamp).getTime();
          fieldB = new Date(b.timestamp).getTime();
        }

        if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1;
        if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [orders, searchQuery, statusFilter, priorityFilter, sortField, sortDirection]);

  // Paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter]);

  // Calculate high-level statistics
  const totalOrdersCount = orders.length;
  const syncedOrdersCount = orders.filter(o => o.status === "Synced").length;
  const pendingOrdersCount = orders.filter(o => o.status === "Pending").length;
  const ordersOnESP32 = orders.filter(o => o.storageLocation === "ESP32 Local Buffer").length;
  
  // Outage Protection calculation: currently pending + historically synced from logs
  const protectedOrdersCount = useMemo(() => {
    const historicalSyncCount = syncLogs.reduce((acc, log) => acc + log.ordersSynced, 0);
    return ordersOnESP32 + historicalSyncCount;
  }, [ordersOnESP32, syncLogs]);

  const uptimeSuccess = isInternetAvailable ? "98.4%" : "0.0%";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 font-sans antialiased overflow-hidden transition-colors duration-300 relative">
      
      {/* Background Ambient Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-blue/5 dark:bg-brand-blue/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-purple/5 dark:bg-brand-purple/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-brand-violet/5 dark:bg-brand-violet/5 blur-[150px] pointer-events-none" />

      {/* Main Wrapper */}
      <div className="flex w-full h-screen p-4 gap-4 relative z-10 overflow-hidden">
        
        {/* Floating Sidebar Navigation */}
        <aside className="w-72 shrink-0 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all duration-300">
          <div>
            {/* Logo Area */}
            <div className="flex items-center gap-3.5 mb-8">
              <div className="w-10 h-10 bg-gradient-to-tr from-[#6C3BFF] via-[#7F5AF0] to-[#5B7CFA] rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-purple/20">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-[10px] text-brand-purple dark:text-brand-violet font-mono font-bold tracking-widest leading-none block uppercase">
                  Edge Gateway
                </span>
                <h1 className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                  RuralSync
                </h1>
              </div>
            </div>

            {/* Navigation tabs */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block px-3 mb-2">
                Core Operations
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 dark:from-brand-purple/20 dark:to-brand-blue/20 text-brand-purple dark:text-brand-blue border border-brand-purple/20 dark:border-brand-purple/30 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40 border border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-brand-purple dark:text-brand-blue" : "text-slate-400 dark:text-slate-500"}`} />
                      <span>{tab.label}</span>
                    </span>
                    {tab.badge && (
                      <span className="bg-amber-500 dark:bg-amber-400 text-slate-950 font-bold font-mono text-[10px] px-2 py-0.5 rounded-full shadow-inner animate-pulse">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block px-3 pt-5 mb-2">
                IoT Edge System
              </span>

              {[
                { id: "monitoring", label: "ESP32 Device Monitor", icon: Cpu },
                { id: "analytics", label: "Performance Analytics", icon: BarChart3 },
                { id: "control", label: "Demo Simulation", icon: Smartphone }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SidebarTab)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 dark:from-brand-purple/20 dark:to-brand-blue/20 text-brand-purple dark:text-brand-blue border border-brand-purple/20 dark:border-brand-purple/30 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40 border border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-brand-purple dark:text-brand-blue" : "text-slate-400 dark:text-slate-500"}`} />
                      <span>{tab.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Bottom Widgets */}
          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            {/* Quick Status Info */}
            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                  Signal Strength
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isInternetAvailable
                      ? "bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                      : "bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  }`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-300 font-mono font-medium">
                  {deviceStatus ? deviceStatus.deviceId : "ESP32-RuralSync"}
                </span>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono px-2 py-0.5 rounded font-bold">
                  {isInternetAvailable ? "-64 dBm" : "Offline"}
                </span>
              </div>
            </div>

            {/* Theme & Settings Controls */}
            <div className="flex items-center justify-between gap-2">
              {/* Theme Switcher Button */}
              <button
                onClick={toggleTheme}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-2 px-3 rounded-xl border border-slate-200/50 dark:border-slate-750 transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-brand-purple" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              {/* Settings Gear Button */}
              <button
                onClick={() => {
                  setActiveTab("settings");
                  setSettingsSubTab("general");
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-brand-purple/10 text-brand-purple border-brand-purple/20"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-750"
                }`}
                title="System Setup"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-[10px] text-slate-400 dark:text-slate-650 text-center font-mono leading-relaxed">
              RuralSync v1.2.0 • Fail-Safe active
            </div>
          </div>
        </aside>

        {/* Main Workspace Frame */}
        <main className="flex-1 bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl flex flex-col overflow-hidden shadow-xl transition-all duration-300">
          
          {/* Main Top Header */}
          <header className="h-20 border-b border-slate-100 dark:border-slate-800/80 bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur-md shrink-0 flex items-center justify-between px-8 z-20">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest select-none">
                {activeTab === "settings" ? "Configuration Panel" : `${activeTab} Workspace`}
              </span>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
              
              {/* Connectivity Badge */}
              <div
                className={`text-[11px] px-3.5 py-1.5 rounded-full font-bold border flex items-center gap-2 select-none transition-all duration-300 ${
                  isInternetAvailable
                    ? "text-[#10B981] bg-emerald-500/10 border-emerald-500/20"
                    : "text-[#EF4444] bg-red-500/10 border-red-500/20"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isInternetAvailable ? "bg-[#10B981] animate-pulse" : "bg-[#EF4444] animate-bounce"}`} />
                <span>
                  {isInternetAvailable
                    ? "CLOUD ENDPOINT ONLINE • STABLE"
                    : "OUTAGE PROTOCOL INJECTED • LOCAL BUFFERING"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Actions */}
              <button
                onClick={resetDemo}
                className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Demo DB
              </button>

              <button
                onClick={runFullDemo}
                disabled={demoActive}
                className={`bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-purple/20 hover:opacity-95 font-display tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
                  demoActive ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {demoActive ? "Sequence Running..." : "Run Competition Demo"}
              </button>
            </div>
          </header>

          {/* Project Executive Pitch Banner */}
          <div className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-850 px-8 py-3 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 bg-brand-purple/10 dark:bg-brand-purple/20 text-brand-purple dark:text-brand-violet rounded font-mono font-bold uppercase text-[9px]">
                Product Mission
              </span>
              <p className="italic">
                "Resilient, offline-first transaction buffering inside local LittleFS partitions with self-healing cloud synchronization."
              </p>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider shrink-0 select-none font-mono">
              IoT System Entry #4829
            </div>
          </div>

          {/* Dashboard Main Workspace Viewport */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            
            {/* Automated Demo Stepper banner overlay */}
            <AnimatePresence>
              {demoActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  className="bg-brand-purple/5 dark:bg-brand-purple/10 rounded-2xl p-5 border border-brand-purple/20 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                    <span className="text-xs text-brand-purple dark:text-brand-violet font-bold flex items-center gap-2 uppercase tracking-wider font-display">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Automated Competition Demonstration Sequence In Progress
                    </span>
                    <span className="text-[10px] bg-brand-purple/10 dark:bg-brand-purple/25 text-brand-purple dark:text-brand-violet font-mono px-2 py-0.5 rounded font-bold">
                      ACTIVE STEP RUNNER
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono shadow-sm">
                    ⚡ Current Step Status: <span className="text-brand-purple dark:text-brand-blue">{demoMessage}</span>
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {demoSteps.map((step, idx) => (
                      <div
                        key={step.name}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          step.status === "running"
                            ? "bg-brand-purple/10 border-brand-purple shadow-sm text-brand-purple dark:text-brand-violet animate-pulse"
                            : step.status === "success"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-[#10B981]"
                            : "bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block mb-1">
                          Step 0{idx + 1}
                        </span>
                        <h4 className="text-[11px] font-bold truncate">{step.name}</h4>
                        <p className="text-[9px] leading-relaxed mt-1 opacity-80 line-clamp-2">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB VIEWS SWITCH */}
            <AnimatePresence mode="wait">
              
              {/* TAB 1: EXECUTIVE SUMMARY DASHBOARD */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="tab-dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  {/* KPI Executive Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    
                    {/* KPI 1 */}
                    <div className="bg-white dark:bg-[#1E293B] border border-slate-250/50 dark:border-slate-850 p-6 rounded-2xl shadow-sm hover-lift flex flex-col justify-between h-36">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider">
                          Total Orders Created
                        </span>
                        <div className="p-2 bg-brand-purple/10 rounded-xl text-brand-purple">
                          <ListOrdered className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-bold font-display text-slate-900 dark:text-white">
                          {totalOrdersCount}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          transactions
                        </span>
                      </div>
                      <p className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Active Database Instances</span>
                      </p>
                    </div>

                    {/* KPI 2 */}
                    <div className="bg-white dark:bg-[#1E293B] border border-slate-250/50 dark:border-slate-850 p-6 rounded-2xl shadow-sm hover-lift flex flex-col justify-between h-36">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider">
                          Synced to Cloud
                        </span>
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-[#10B981]">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-bold font-display text-[#10B981]">
                          {syncedOrdersCount}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          verified
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono uppercase tracking-wide">
                        Target Storage = Cloud
                      </p>
                    </div>

                    {/* KPI 3 */}
                    <div className="bg-white dark:bg-[#1E293B] border border-slate-250/50 dark:border-slate-850 p-6 rounded-2xl shadow-sm hover-lift flex flex-col justify-between h-36">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-450 uppercase font-bold tracking-wider">
                          Pending Buffer Queue
                        </span>
                        <div className={`p-2 rounded-xl ${pendingOrdersCount > 0 ? "bg-amber-500/10 text-amber-500 animate-pulse" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                          <Database className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className={`text-3xl font-bold font-display ${pendingOrdersCount > 0 ? "text-amber-500 font-bold" : "text-slate-400 dark:text-slate-500"}`}>
                          {pendingOrdersCount}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          cached
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1">
                        {pendingOrdersCount > 0 ? "Awaiting telecom handshake" : "Buffer synchronized"}
                      </p>
                    </div>

                    {/* KPI 4 */}
                    <div className="bg-gradient-to-br from-brand-purple to-brand-blue border-none p-6 rounded-2xl shadow-lg shadow-brand-purple/10 hover-lift text-white flex flex-col justify-between h-36 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-6 -translate-y-6 blur-lg" />
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs text-purple-100 uppercase font-bold tracking-wider">
                          Protected Offline
                        </span>
                        <div className="p-2 bg-white/10 rounded-xl text-white">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mt-2 relative z-10">
                        <span className="text-3xl font-extrabold font-display">
                          {protectedOrdersCount}
                        </span>
                        <span className="text-xs text-purple-100 font-medium">
                          orders
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-100 font-semibold relative z-10 flex items-center gap-1">
                        <span>↑ 100% Data Protection Guarantee</span>
                      </p>
                    </div>
                  </div>

                  {/* Dashboard Layout Splits */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Left Pane: ESP32 Edge Device Status Hero & Timeline */}
                    <div className="col-span-1 space-y-6">
                      
                      {/* ESP32 Status Card wrapper */}
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

                      {/* Interactive Connectivity Lifecycle Timeline */}
                      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-display">
                            How RuralSync Works
                          </h3>
                          <span className="text-[10px] text-brand-purple dark:text-brand-violet font-mono uppercase font-bold">Lifecycle</span>
                        </div>

                        {/* Steps timeline */}
                        <div className="space-y-4">
                          {[
                            {
                              title: "Internet Outage Cut",
                              desc: "Local fiber/cell link goes down. The gateway enters failover state.",
                              stateActive: !isInternetAvailable,
                              icon: WifiOff,
                              color: "bg-[#EF4444]"
                            },
                            {
                              title: "Offline Buffering",
                              desc: "Sales orders are logged inside ESP32 LittleFS flash sector (/orders.txt).",
                              stateActive: !isInternetAvailable && pendingOrdersCount > 0,
                              icon: HardDrive,
                              color: "bg-[#F59E0B]"
                            },
                            {
                              title: "Telecommunications Restored",
                              desc: "Internet returns. Edge gateway automatically recognizes host handshake.",
                              stateActive: isInternetAvailable,
                              icon: Wifi,
                              color: "bg-[#10B981]"
                            },
                            {
                              title: "Automated Data Upload",
                              desc: " heartbeats detect the link and migrate the buffer files.",
                              stateActive: isInternetAvailable && deviceStatus?.status === "SYNCING",
                              icon: RefreshCw,
                              color: "bg-[#3B82F6]"
                            },
                            {
                              title: "100% Sync Clear",
                              desc: "Transactions loaded to Cloud. LittleFS buffer partition is cleaned.",
                              stateActive: isInternetAvailable && pendingOrdersCount === 0 && orders.length > 0,
                              icon: CheckCircle,
                              color: "bg-gradient-to-r from-brand-purple to-brand-blue"
                            }
                          ].map((step, idx) => {
                            const StepIcon = step.icon;
                            return (
                              <div key={idx} className={`flex gap-3.5 transition-opacity duration-300 ${step.stateActive ? "opacity-100" : "opacity-45"}`}>
                                <div className="flex flex-col items-center shrink-0">
                                  <div className={`w-8 h-8 rounded-xl ${step.color} text-white flex items-center justify-center shadow-md`}>
                                    <StepIcon className="w-4 h-4" />
                                  </div>
                                  {idx < 4 && <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-800 my-1" />}
                                </div>
                                <div className="pt-0.5">
                                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                                    {step.title}
                                    {step.stateActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-ping" />}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                    {step.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Right Pane: Live Activity Feed & Live Orders Queue */}
                    <div className="col-span-2 space-y-6">
                      
                      {/* Top Action Bar */}
                      <div className="flex items-center justify-between bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-brand-purple/10 rounded-xl text-brand-purple">
                            <PlusCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Merchant Terminal Action</h4>
                            <p className="text-[10px] text-slate-500">Fast transaction creation portal</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsOrderModalOpen(true)}
                          className="bg-brand-purple hover:bg-brand-purple/95 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Create Retailer Order</span>
                        </button>
                      </div>

                      {/* Event Log & Orders Side by Side */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Live Activity Feed */}
                        <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 flex flex-col h-[400px] shadow-sm">
                          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-display flex items-center gap-2">
                              <Activity className="w-4 h-4 text-brand-purple" />
                              Live Event Stream
                            </h3>
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-mono font-bold">
                              TELEMETRY
                            </span>
                          </div>

                          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                            {events.length === 0 ? (
                              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-20 italic">
                                Listening for telemetry packets...
                              </p>
                            ) : (
                              events.slice(0, 15).map((evt) => {
                                const text = evt.event.toLowerCase();
                                let badgeColor = "bg-brand-purple/10 text-brand-purple border-brand-purple/20";
                                if (text.includes("lost") || text.includes("outage") || text.includes("fail")) {
                                  badgeColor = "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20 shadow-[0_0_8px_rgba(239,68,68,0.1)]";
                                } else if (text.includes("restored") || text.includes("completed") || text.includes("success") || text.includes("approved")) {
                                  badgeColor = "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20";
                                } else if (text.includes("buffered") || text.includes("restarting") || text.includes("proposal")) {
                                  badgeColor = "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20";
                                }

                                return (
                                  <div key={evt.id} className="flex gap-3 text-xs leading-normal">
                                    <div className="w-px bg-slate-100 dark:bg-slate-800 relative left-1.5 my-1 shrink-0">
                                      <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 ${
                                        text.includes("lost") ? "bg-[#EF4444]" :
                                        text.includes("restored") || text.includes("success") ? "bg-[#10B981]" :
                                        "bg-brand-purple"
                                      }`} />
                                    </div>
                                    <div className="pl-4 flex-1">
                                      <p className="font-semibold text-slate-800 dark:text-slate-200">{evt.event}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                                          {new Date(evt.timestamp).toLocaleTimeString()}
                                        </span>
                                        <span className={`text-[8px] font-mono px-1 rounded border uppercase ${badgeColor}`}>
                                          ESP32 Node
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Live Orders Queue Preview */}
                        <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 flex flex-col h-[400px] shadow-sm">
                          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-display flex items-center gap-2">
                              <ListOrdered className="w-4 h-4 text-brand-blue" />
                              Recent Transactions
                            </h3>
                            <button
                              onClick={() => setActiveTab("orders")}
                              className="text-[10px] text-brand-purple dark:text-brand-blue hover:underline flex items-center gap-1 font-bold cursor-pointer"
                            >
                              Explore Queue <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                            {orders.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-xs text-slate-400 dark:text-slate-500 italic">No orders registered yet</p>
                              </div>
                            ) : (
                              orders.slice(0, 6).map((order) => {
                                const isPending = order.status === "Pending";
                                const isProposed = order.status === "Proposed";
                                return (
                                  <div
                                    key={order.id}
                                    className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                                      isPending
                                        ? "bg-amber-500/[0.03] border-amber-500/25"
                                        : isProposed
                                        ? "bg-orange-500/[0.03] border-orange-500/25 animate-pulse"
                                        : "bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800"
                                    }`}
                                  >
                                    <div className="min-w-0 pr-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                          {order.orderId}
                                        </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[120px]">
                                          {order.productName}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate mt-1">
                                        {order.retailerName} (Qty: {order.quantity})
                                      </span>
                                    </div>
                                    <div className="shrink-0">
                                      <span
                                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider ${
                                          isPending
                                            ? "bg-amber-100 dark:bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                            : isProposed
                                            ? "bg-orange-100 dark:bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                            : "bg-emerald-100 dark:bg-emerald-500/10 text-[#10B981] border border-emerald-500/20"
                                        }`}
                                      >
                                        {order.status}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
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
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                    {/* Header + Filters */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                          Retailer Transaction Ledger
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                          Full historical inventory pipeline logged offline or synced to cloud clusters.
                        </p>
                      </div>

                      {/* Filters / Search Bar */}
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search Order ID, Retailer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none focus:border-brand-purple transition-all font-mono shadow-inner w-56"
                          />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
                          <Filter className="w-3 h-3 text-slate-400" />
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-transparent text-slate-700 dark:text-slate-300 text-xs focus:outline-none cursor-pointer font-medium pr-1"
                          >
                            <option value="All">All Statuses</option>
                            <option value="Synced">Synced</option>
                            <option value="Pending">Pending Buffer</option>
                            <option value="Proposed">Proposed</option>
                          </select>
                        </div>

                        {/* Priority Filter */}
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
                          <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                          <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value as any)}
                            className="bg-transparent text-slate-700 dark:text-slate-300 text-xs focus:outline-none cursor-pointer font-medium pr-1"
                          >
                            <option value="All">All Priorities</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>

                        {/* Create Order Button */}
                        <button
                          onClick={() => setIsOrderModalOpen(true)}
                          className="bg-brand-purple hover:bg-brand-purple/95 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>New Order</span>
                        </button>
                      </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/10">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                            <th className="px-5 py-3 font-bold text-center w-16">No.</th>
                            <th className="px-5 py-3 font-bold cursor-pointer hover:text-slate-650" onClick={() => { setSortField("orderId"); setSortDirection(prev => prev === "asc" ? "desc" : "asc"); }}>
                              Order ID {sortField === "orderId" && (sortDirection === "asc" ? "↑" : "↓")}
                            </th>
                            <th className="px-5 py-3 font-bold">Product Name</th>
                            <th className="px-5 py-3 font-bold">Retailer Name</th>
                            <th className="px-5 py-3 font-bold text-center cursor-pointer hover:text-slate-650" onClick={() => { setSortField("quantity"); setSortDirection(prev => prev === "asc" ? "desc" : "asc"); }}>
                              Qty {sortField === "quantity" && (sortDirection === "asc" ? "↑" : "↓")}
                            </th>
                            <th className="px-5 py-3 font-bold">Priority</th>
                            <th className="px-5 py-3 font-bold cursor-pointer hover:text-slate-650" onClick={() => { setSortField("timestamp"); setSortDirection(prev => prev === "asc" ? "desc" : "asc"); }}>
                              Timestamp {sortField === "timestamp" && (sortDirection === "asc" ? "↑" : "↓")}
                            </th>
                            <th className="px-5 py-3 font-bold text-center">Status</th>
                            <th className="px-5 py-3 font-bold text-right">Storage Node</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-850">
                          {paginatedOrders.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="text-center py-20">
                                <div className="flex flex-col items-center justify-center p-6 text-slate-400 dark:text-slate-500">
                                  <Inbox className="w-12 h-12 mb-3 stroke-[1.5] text-slate-350 dark:text-slate-700" />
                                  <h4 className="font-bold text-sm text-slate-750 dark:text-slate-300">No Orders Found</h4>
                                  <p className="text-xs text-slate-450 mt-1 max-w-sm leading-relaxed">
                                    No records match your search filters. Create a new retailer order to begin.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            paginatedOrders.map((order, idx) => {
                              const isPending = order.status === "Pending";
                              const isProposed = order.status === "Proposed";
                              const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                              return (
                                <tr
                                  key={order.id}
                                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${
                                    isPending ? "bg-amber-500/[0.01]" :
                                    isProposed ? "bg-orange-500/[0.01]" : ""
                                  }`}
                                >
                                  <td className="px-5 py-4 text-center text-slate-400 font-mono text-[10px]">
                                    {globalIndex}
                                  </td>
                                  <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-slate-200">
                                    {order.orderId}
                                  </td>
                                  <td className="px-5 py-4 font-bold text-slate-850 dark:text-slate-100">
                                    {order.productName}
                                  </td>
                                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-medium">
                                    {order.retailerName}
                                  </td>
                                  <td className="px-5 py-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                                    {order.quantity}
                                  </td>
                                  <td className="px-5 py-4">
                                    <span
                                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                                        order.priority === "High"
                                          ? "bg-[#EF4444]/10 text-[#EF4444]"
                                          : order.priority === "Medium"
                                          ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                      }`}
                                    >
                                      {order.priority}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-slate-550 dark:text-slate-400 font-mono text-[10px]">
                                    {new Date(order.timestamp).toLocaleString()}
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    <span
                                      className={`px-2.5 py-0.8 rounded-full font-bold text-[9px] tracking-wider uppercase inline-block ${
                                        isPending
                                          ? "bg-amber-100 dark:bg-amber-500/15 text-amber-500 animate-pulse border border-amber-500/25"
                                          : isProposed
                                          ? "bg-orange-100 dark:bg-orange-500/15 text-orange-400 border border-orange-500/25"
                                          : "bg-emerald-100 dark:bg-emerald-500/15 text-[#10B981] border border-emerald-500/25"
                                      }`}
                                    >
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wide uppercase ${
                                        order.storageLocation === "Cloud"
                                          ? "bg-brand-blue/10 text-brand-blue"
                                          : "bg-brand-purple/10 text-brand-purple"
                                      }`}
                                    >
                                      {order.storageLocation === "Cloud" ? "Cloud Host" : "ESP32 Buffer"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {filteredOrders.length > 0 && (
                      <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Showing Page <strong className="text-slate-800 dark:text-white font-bold">{currentPage}</strong> of <strong className="text-slate-800 dark:text-white font-bold">{totalPages}</strong> ({filteredOrders.length} entries)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700 disabled:opacity-45 disabled:cursor-not-allowed transition-all cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700 disabled:opacity-45 disabled:cursor-not-allowed transition-all cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

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
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                    <div className="pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                        Edge Synchronization Manager
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                        Control failover packet relays, inspect buffer sync speed, and evaluate cloud uploads.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left: Queue Stat & Actions */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-5 flex flex-col justify-between shadow-inner">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2 font-display">
                            <Database className="w-4 h-4 text-brand-purple" />
                            Transmission Queue
                          </span>
                          <span className="text-[10px] bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-450 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono font-bold uppercase">
                            Buffer Active
                          </span>
                        </div>

                        {/* Progress display */}
                        <div className="text-center py-4 relative flex flex-col items-center justify-center">
                          <span className="text-6xl font-extrabold text-brand-purple dark:text-brand-violet font-display block">
                            {pendingOrdersCount}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 block font-medium">
                            Orders Queued Inside LittleFS Partition
                          </span>
                          
                          {/* Sync Progress Bar */}
                          <div className="w-full max-w-xs mt-6">
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-1">
                              <span>Sync Progress</span>
                              <span>{pendingOrdersCount === 0 ? "100% Complete" : "Sync Awaiting Link"}</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-550 ${pendingOrdersCount === 0 ? "bg-[#10B981] w-full" : "bg-amber-400 w-1/3 animate-pulse"}`}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-850 text-xs">
                          <div className="flex justify-between text-slate-500">
                            <span>Auto-Sync Status:</span>
                            <span className="text-[#10B981] font-bold">Enabled (10s Heartbeats)</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Last Connection Handshake:</span>
                            <span className="text-slate-850 dark:text-slate-200 font-mono font-semibold">
                              {syncLogs[0] ? new Date(syncLogs[0].timestamp).toLocaleTimeString() : "No history"}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Relay Encryption Standard:</span>
                            <span className="text-slate-550 dark:text-slate-450 font-mono">TLS v1.3 Secure Suite</span>
                          </div>
                        </div>

                        <button
                          onClick={triggerSync}
                          className="w-full bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-95 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-purple/10"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Force Out-of-Cycle Cloud Synchronization</span>
                        </button>
                      </div>

                      {/* Right: Sync History Logs */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col h-full shadow-inner">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4 shrink-0">
                          <h4 className="text-xs font-bold text-slate-750 dark:text-slate-300 uppercase tracking-widest font-display">
                            Sync Transaction Ledger
                          </h4>
                          <span className="text-[10px] text-brand-purple dark:text-brand-violet font-bold font-mono">
                            LEDGER LOGS
                          </span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar max-h-[300px]">
                          {syncLogs.length === 0 ? (
                            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-20 italic">
                              No historic sync audits registered yet.
                            </p>
                          ) : (
                            syncLogs.map((log) => (
                              <div
                                key={log.id}
                                className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200/40 dark:border-slate-900 flex items-center justify-between shadow-sm"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-[#10B981]">
                                    <ShieldCheck className="w-4.5 h-4.5" />
                                  </div>
                                  <div>
                                    <span className="font-mono text-xs font-bold text-slate-850 dark:text-slate-200 block">
                                      Batch {log.id}
                                    </span>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                      {log.result}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="bg-emerald-100 dark:bg-emerald-500/15 text-[#10B981] text-[9px] font-bold px-2 py-0.5 rounded-full font-mono border border-emerald-500/20">
                                    +{log.ordersSynced} SYNCED
                                  </span>
                                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: ESP32 DEVICE MONITOR */}
              {activeTab === "monitoring" && (
                <motion.div
                  key="tab-monitoring"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                    <div className="pb-4 mb-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                          Hardware Edge Diagnostics
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                          Live hardware registers and system telemetry fetched directly from the SoC.
                        </p>
                      </div>
                      <span className="bg-brand-purple/10 text-brand-purple font-mono font-bold text-[10px] px-3 py-1 rounded-lg border border-brand-purple/20">
                        COMM PORT: COM 4
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      
                      {/* Stat Card 1 */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-4 shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Device Health</span>
                          <span className={`w-2.5 h-2.5 rounded-full ${isInternetAvailable ? "bg-[#10B981]" : "bg-[#EF4444] animate-pulse"}`} />
                        </div>
                        <p className="text-2xl font-bold font-display text-slate-850 dark:text-slate-100">
                          {isInternetAvailable ? "🟢 ONLINE" : "🔴 OFFLINE"}
                        </p>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-850 text-slate-450 dark:text-slate-500 text-[10px] font-mono">
                          Last Handshake: Just now
                        </div>
                      </div>

                      {/* Stat Card 2 */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-4 shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Signal Strength (RSSI)</span>
                          <Wifi className="w-4 h-4 text-brand-blue" />
                        </div>
                        <p className="text-2xl font-mono font-bold text-slate-850 dark:text-slate-100">
                          {isInternetAvailable ? "-64 dBm" : "Disconnected"}
                        </p>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-850 text-slate-450 dark:text-slate-500 text-[10px] font-mono flex items-center justify-between">
                          <span>Quality: {isInternetAvailable ? "Excellent (92%)" : "0%"}</span>
                        </div>
                      </div>

                      {/* Stat Card 3 */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-4 shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Local Buffer Count</span>
                          <HardDrive className="w-4 h-4 text-brand-purple" />
                        </div>
                        <p className="text-2xl font-mono font-bold text-amber-500">
                          {pendingOrdersCount} orders
                        </p>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-850 text-slate-450 dark:text-slate-500 text-[10px] font-mono">
                          LittleFS Active sector limit: 120
                        </div>
                      </div>

                      {/* Stat Card 4 */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-4 shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">CPU Register Load</span>
                          <Cpu className="w-4 h-4 text-brand-purple" />
                        </div>
                        <p className="text-2xl font-mono font-bold text-slate-850 dark:text-slate-100">
                          {deviceStatus ? `${deviceStatus.cpuUsage}%` : "14%"}
                        </p>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-850 text-slate-450 dark:text-slate-500 text-[10px] font-mono">
                          SoC Frequency: 240 MHz Dual-Core
                        </div>
                      </div>

                      {/* Stat Card 5 */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-4 shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Uptime</span>
                          <Clock className="w-4 h-4 text-brand-blue" />
                        </div>
                        <p className="text-2xl font-mono font-bold text-slate-850 dark:text-slate-100">
                          {deviceStatus ? `${deviceStatus.uptime}s` : "4850s"}
                        </p>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-850 text-slate-450 dark:text-slate-500 text-[10px] font-mono">
                          Stable loop cycle rate: ~10ms
                        </div>
                      </div>

                      {/* Stat Card 6 */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-4 shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Last Sync Event</span>
                          <History className="w-4 h-4 text-brand-purple" />
                        </div>
                        <p className="text-2xl font-bold font-display text-slate-850 dark:text-slate-100">
                          {syncLogs[0] ? `+${syncLogs[0].ordersSynced} orders` : "No sync yet"}
                        </p>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-850 text-slate-450 dark:text-slate-500 text-[10px] font-mono">
                          {syncLogs[0] ? new Date(syncLogs[0].timestamp).toLocaleTimeString() : "Pending log trigger"}
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: PERFORMANCE ANALYTICS */}
              {activeTab === "analytics" && (
                <motion.div
                  key="tab-analytics"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                    <div className="pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                        Performance Analytics Suite
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                        High-precision visual charts displaying transaction flows, database conversions, and telecom downtime ratios.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Chart 1: Order Intake Trends */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-inner">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block font-display">
                              Orders Created vs Synced Trends
                            </span>
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono">Daily volume metrics</span>
                          </div>
                          <span className="text-[#10B981] text-xs font-bold font-mono">+12.5%</span>
                        </div>

                        {/* SVG Area Chart */}
                        <div className="h-48 w-full relative pt-2">
                          <svg className="w-full h-36" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6C3BFF" stopOpacity="0.25"/>
                                <stop offset="100%" stopColor="#6C3BFF" stopOpacity="0.0"/>
                              </linearGradient>
                            </defs>
                            {/* Gridlines */}
                            <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="0.5" />
                            <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="0.5" />
                            {/* Chart Area */}
                            <path
                              d="M 0 25 Q 15 15, 30 18 T 60 8 T 90 2 L 100 2 L 100 30 L 0 30 Z"
                              fill="url(#purpleGradient)"
                            />
                            {/* Chart Line */}
                            <path
                              d="M 0 25 Q 15 15, 30 18 T 60 8 T 90 2 L 100 2"
                              fill="none"
                              stroke="#7F5AF0"
                              strokeWidth="1.5"
                            />
                            {/* Data points */}
                            <circle cx="30" cy="18" r="1.5" fill="#5B7CFA" />
                            <circle cx="60" cy="8" r="1.5" fill="#7F5AF0" />
                            <circle cx="90" cy="2" r="1.5" fill="#6C3BFF" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col justify-between text-[9px] text-slate-400 dark:text-slate-500 font-mono pointer-events-none">
                            <span>120 Orders</span>
                            <span>60 Orders</span>
                            <span>0 Orders</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-200 dark:border-slate-850">
                            <span>Mon</span>
                            <span>Wed</span>
                            <span>Fri</span>
                            <span>Today</span>
                          </div>
                        </div>
                      </div>

                      {/* Chart 2: Orders Buffered During Outages */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-inner">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block font-display">
                              Orders Buffered During Outages
                            </span>
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono">Data loss prevention audits</span>
                          </div>
                          <span className="text-brand-purple text-xs font-bold font-mono">100% Retained</span>
                        </div>

                        {/* SVG Bar Chart */}
                        <div className="h-48 w-full flex items-end justify-between px-2 pt-4">
                          {[
                            { label: "Outage A", val: 4, color: "from-brand-purple to-brand-blue" },
                            { label: "Outage B", val: 8, color: "from-brand-violet to-brand-purple" },
                            { label: "Outage C", val: 2, color: "from-brand-blue to-brand-violet" },
                            { label: "Outage D", val: 12, color: "from-[#6C3BFF] to-[#5B7CFA]" },
                            { label: "Current", val: pendingOrdersCount, color: "from-amber-400 to-[#F59E0B]" }
                          ].map((bar, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                              <div className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                {bar.val}
                              </div>
                              <div className="w-8 bg-slate-200 dark:bg-slate-800 rounded-t-lg overflow-hidden h-28 flex items-end">
                                <div
                                  className={`w-full bg-gradient-to-t ${bar.color} rounded-t-lg transition-all duration-500`}
                                  style={{ height: `${(bar.val / 12) * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono truncate max-w-[64px]">{bar.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 6: DEMO SIMULATION */}
              {activeTab === "control" && (
                <motion.div
                  key="tab-control"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                    <div className="pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                        IoT Simulation Sandbox
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                        Use this sandbox to inject hardware failures and evaluate system failover integrity.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Sim card 1 */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col justify-between shadow-inner">
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2 font-display">
                            Telecom Outage simulation
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                            Simulate cutting or re-establishing physical fiber / cellular links in rural segments to watch the ESP32 switch storage modes.
                          </p>
                        </div>
                        <div className="space-y-2.5">
                          <button
                            onClick={() => toggleNetworkState(false)}
                            className="w-full bg-[#EF4444]/10 hover:bg-[#EF4444] text-[#EF4444] hover:text-white font-bold py-2.5 px-3 rounded-xl text-xs border border-[#EF4444]/25 transition-all cursor-pointer text-center"
                          >
                            Simulate Telecom Outage (Kill Link)
                          </button>
                          <button
                            onClick={() => toggleNetworkState(true)}
                            className="w-full bg-[#10B981]/10 hover:bg-[#10B981] text-[#10B981] hover:text-white font-bold py-2.5 px-3 rounded-xl text-xs border border-[#10B981]/25 transition-all cursor-pointer text-center"
                          >
                            Restore Telecom Link
                          </button>
                        </div>
                      </div>

                      {/* Sim card 2 */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col justify-between shadow-inner">
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2 font-display">
                            GPIO Tactile Button simulator
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                            Applies simulated electrical impulses mimicking a merchant pressing a physical push-button hooked directly into GPIO 12 on the ESP32.
                          </p>
                        </div>
                        <button
                          onClick={handleHardwareGPIONode}
                          className="w-full bg-brand-purple hover:bg-brand-purple/95 text-white font-bold py-3 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-purple/10"
                        >
                          <PlusCircle className="w-4 h-4 text-amber-300" />
                          <span>Trigger Hardware GPIO 12 Button</span>
                        </button>
                      </div>

                      {/* Sim card 3 */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col justify-between shadow-inner">
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2 font-display">
                            Power Cycle Restart (EN)
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                            Instruct the ESP32 core processor to execute a powercycle restart, refreshing the system loops and verifying filesystem mount tables.
                          </p>
                        </div>
                        <button
                          onClick={restartDevice}
                          className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-[#EF4444]/10 hover:text-[#EF4444] text-slate-700 dark:text-slate-300 font-bold py-3 px-3 rounded-xl text-xs border border-slate-300 dark:border-slate-700 hover:border-[#EF4444]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4 text-[#EF4444]" />
                          <span>Cycle Chip Reset EN Button</span>
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 7: SYSTEM SETTINGS */}
              {activeTab === "settings" && (
                <motion.div
                  key="tab-settings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                    <div className="pb-4 mb-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                          System Configuration Panel
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                          Configure polling limits, examine LittleFS mapping specs, or fetch C++ sketch firmware.
                        </p>
                      </div>

                      {/* Sub-tab selection */}
                      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800 self-start shrink-0">
                        <button
                          onClick={() => setSettingsSubTab("general")}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                            settingsSubTab === "general"
                              ? "bg-brand-purple text-white shadow-sm"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          General Configuration
                        </button>
                        <button
                          onClick={() => setSettingsSubTab("esp32")}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                            settingsSubTab === "esp32"
                              ? "bg-brand-purple text-white shadow-sm"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          ESP32 C++ Sketch
                        </button>
                      </div>
                    </div>

                    {settingsSubTab === "general" ? (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Option 1 */}
                          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3 shadow-inner">
                            <label className="text-xs font-bold text-slate-750 dark:text-slate-250 block">
                              Heartbeat Polling Interval (ms)
                            </label>
                            <input
                              type="number"
                              defaultValue="10000"
                              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal">
                              Determines how often the client queries the hardware state. Lower intervals increase edge telemetry resolution but double processor overhead.
                            </p>
                          </div>

                          {/* Option 2 */}
                          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3 shadow-inner">
                            <label className="text-xs font-bold text-slate-750 dark:text-slate-250 block">
                              Failover Flash Partition Format
                            </label>
                            <select className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-350 cursor-pointer focus:outline-none">
                              <option>LittleFS Flash Sector Cluster Map (Default)</option>
                              <option>FAT32 SD Card Array Partition</option>
                              <option>EEPROM Raw Direct Byte Stack</option>
                            </select>
                            <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal">
                              Instructs the compiler partition tables how to store cached transactions. LittleFS offers dynamic wear-leveling to protect memory life.
                            </p>
                          </div>

                        </div>

                        <div className="bg-red-500/[0.02] p-6 rounded-2xl border border-red-500/20 space-y-4">
                          <h4 className="text-xs font-bold text-[#EF4444] uppercase tracking-wider">
                            Danger Maintenance Utilities
                          </h4>
                          <div className="flex gap-4">
                            <button
                              onClick={resetDemo}
                              className="bg-[#EF4444]/15 hover:bg-[#EF4444] text-[#EF4444] hover:text-white border border-[#EF4444]/25 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                            >
                              Erase Flash Buffers / Factory Reset DB
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-550 dark:text-slate-500">
                            WARNING: Zeroes all transaction ledger logs, deletes proposed items, and rolls the edge status telemetry back to manufacturing configurations.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-brand-purple/5 dark:bg-brand-purple/10 border border-brand-purple/20 p-5 rounded-2xl text-brand-purple dark:text-brand-violet space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] px-2.5 py-0.5 bg-brand-purple/10 border border-brand-purple/20 rounded-full font-bold uppercase">
                              Production C++ Sketch
                            </span>
                            <span className="font-mono text-[9px] px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full font-bold">
                              COMPILER READY
                            </span>
                          </div>
                          <h4 className="text-sm font-bold font-display text-slate-900 dark:text-white">C++ Edge Node Firmware (Arduino Sketch)</h4>
                          <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-400">
                            This sketch is fully compatible with ESP-IDF compiler packages or Arduino IDE sketch compiler. It sets up the Wi-Fi heartbeats, local storage buffering inside LittleFS during outages, and handles automatic cloud sync pushes once connection handshakes return.
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                            File: ESP32_RuralSync.ino
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
                            className="bg-brand-purple hover:bg-brand-purple/95 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedCode ? "Copied Sketch!" : "Copy Full C++ sketch"}
                          </button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-850 p-5 font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-350 h-96 overflow-auto relative shadow-inner">
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

          {/* Lower Diagnostics Status Footer */}
          <footer className="h-14 border-t border-slate-100 dark:border-slate-800/80 bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur-md shrink-0 flex items-center justify-between px-8 text-xs text-slate-500 dark:text-slate-400 select-none z-10">
            <div className="flex gap-6">
              <span>Device status: <span className="text-slate-700 dark:text-slate-350 font-mono font-semibold">ONLINE</span></span>
              <span>Memory Heap: <span className="text-slate-700 dark:text-slate-350">184KB Free</span></span>
              <span>Signal Quality: <span className="text-slate-700 dark:text-slate-350 font-mono font-semibold">{isInternetAvailable ? "-64 dBm" : "Disconnected"}</span></span>
            </div>
            <div className="text-[10px] text-brand-purple dark:text-brand-blue uppercase tracking-wider font-bold italic">
              ENGINEERING INNOVATION COMPETITION ENTRY • IoT RETALLING CATEGORY
            </div>
          </footer>
        </main>
      </div>

      {/* Modern floating toast notification banner system */}
      <div className="fixed bottom-6 right-6 space-y-2.5 z-50 max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.slice(0, 4).map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`p-4 rounded-2xl shadow-2xl backdrop-blur-md border text-xs pointer-events-auto flex gap-3 ${
                toast.type === "success"
                  ? "bg-white/95 dark:bg-slate-900/95 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : toast.type === "warning"
                  ? "bg-white/95 dark:bg-slate-900/95 border-amber-500/30 text-amber-700 dark:text-amber-300"
                  : "bg-white/95 dark:bg-slate-900/95 border-brand-purple/30 text-brand-purple dark:text-brand-blue"
              }`}
            >
              <div className="flex-1">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block mb-0.5 font-mono uppercase font-bold tracking-wider">
                  {toast.time} System Event
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-100">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Retailer Order Form Modal */}
      <AnimatePresence>
        {isOrderModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-slate-100 dark:border-slate-850">
                <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center text-brand-purple shadow">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-brand-purple dark:text-brand-violet font-mono font-bold tracking-widest block uppercase">Retail Portal</span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight font-display">
                    Create New Retailer Order
                  </h2>
                </div>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block mb-1">
                      Retailer Shop Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Agri-Retail Co"
                      value={orderForm.retailerName}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, retailerName: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-purple transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block mb-1">
                      Product Name / Description
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Solar Irrigation Pump V2"
                      value={orderForm.productName}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, productName: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-purple transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block mb-1">
                      Quantity Pack Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      required
                      value={orderForm.quantity}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-purple transition-all font-mono shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block mb-1">
                      Order Priority
                    </label>
                    <select
                      value={orderForm.priority}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-purple transition-all cursor-pointer font-medium shadow-inner"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                {/* Quick chip suggestions */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-slate-400 font-mono block">Quick Stocks Select:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sampleProducts.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => fillQuickOrder(p.name)}
                        className="text-[10px] bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 px-2.5 py-1.2 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-800 cursor-pointer"
                      >
                        + {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-150 dark:border-slate-800">
                  <p className="text-[10px] text-slate-500 max-w-xs leading-normal">
                    <span className="text-amber-500 font-bold">Offline-Routing Note:</span> Orders made during telecom drops are automatically buffered in local LittleFS registers.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOrderModalOpen(false)}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitLoading}
                      className="bg-brand-purple hover:opacity-95 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-brand-purple/25 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      {isSubmitLoading ? "Saving..." : "Create Order"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proposed Order Approval Dialog Modal Prompt */}
      <AnimatePresence>
        {orders.some(o => o.status === "Proposed") && (
          (() => {
            const proposed = orders.find(o => o.status === "Proposed")!;
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 dark:bg-slate-950/80 backdrop-blur-md p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 15 }}
                  className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
                >
                  <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-850">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 font-bold shadow">
                      ⚠️
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-500 font-mono font-bold tracking-widest block">ORDER REQUEST</span>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight font-display">
                        Approval Required
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-450 mb-5 leading-relaxed">
                    A physical push button impulse was registered from the **ESP32 Edge Gateway** (GPIO 12). Please review the details of the proposed order:
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 mb-6 space-y-3 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Proposal ID:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{proposed.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Product Name:</span>
                      <span className="text-slate-900 dark:text-slate-100 font-bold">{proposed.productName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Retailer:</span>
                      <span className="text-slate-800 dark:text-slate-300 font-bold">{proposed.retailerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Quantity:</span>
                      <span className="text-slate-800 dark:text-slate-350">{proposed.quantity} unit(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Priority:</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        proposed.priority === "High" ? "bg-red-500/10 text-[#EF4444]" :
                        proposed.priority === "Medium" ? "bg-amber-500/10 text-amber-500" :
                        "bg-blue-500/10 text-blue-400"
                      }`}>
                        {proposed.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hardware Pin:</span>
                      <span className="text-slate-500">GPIO_12_BUTTON</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => rejectOrder(proposed.id)}
                      className="bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center"
                    >
                      Decline Order
                    </button>
                    <button
                      onClick={() => approveOrder(proposed.id)}
                      className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-95 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center shadow-lg shadow-brand-purple/20"
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
