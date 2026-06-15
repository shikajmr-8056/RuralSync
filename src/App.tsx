import React, { useState, useEffect, useMemo } from "react";
import {
  Cpu,
  Wifi,
  WifiOff,
  CheckCircle,
  RotateCcw,
  PlusCircle,
  ListOrdered,
  Activity,
  RefreshCw,
  ArrowRight,
  Clock,
  X,
  Sun,
  Moon,
  ChevronRight,
  ChevronLeft,
  Inbox,
  Zap,
  Database,
  Settings as SettingsIcon,
  User,
  Users,
  LogOut,
  ShoppingBag,
  CreditCard,
  Truck,
  BarChart3,
  Layers,
  DollarSign,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRuralSync } from "./useRuralSync";
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
  } = useRuralSync();

  // Multi-portal context: "guest" | "customer" | "supplier"
  const [userRole, setUserRole] = useState<"guest" | "customer" | "supplier">("guest");
  
  // Login form credentials simulation
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Auth / Signup state
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "", shopName: "", role: "customer" as "customer" | "supplier" });
  const [loginRole, setLoginRole] = useState<"none" | "customer" | "supplier">("none");

  // Theme state: light or dark
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
      return "light";
    }
    return "light";
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

  // Active tab state depending on current portal
  const [customerTab, setCustomerTab] = useState<"dashboard" | "create-order" | "tracking" | "queue" | "profile" | "esp32">("dashboard");
  const [supplierTab, setSupplierTab] = useState<"dashboard" | "incoming" | "dispatch" | "analytics" | "profile">("dashboard");
  
  // Settings view toggle
  const [showSettings, setShowSettings] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState<"general" | "esp32">("general");
  const [copiedCode, setCopiedCode] = useState(false);

  // Profile functional state
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileLocation, setProfileLocation] = useState("");
  const [profileShopName, setProfileShopName] = useState("");
  const [profileLanguage, setProfileLanguage] = useState("English");
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);

  // Order form state
  const [orderForm, setOrderForm] = useState({
    productName: "",
    quantity: 1,
    priority: "Medium" as "Low" | "Medium" | "High",
    shopName: "",
    notes: "",
    pricePerUnit: 1500
  });

  // Filters for orders views
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"All" | "Low" | "Medium" | "High">("All");

  // Local loading states
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  // Payment request modal state (Supplier side)
  const [paymentRequestOrder, setPaymentRequestOrder] = useState<typeof orders[0] | null>(null);

  // Customer payment modal state
  const [customerPaymentOrder, setCustomerPaymentOrder] = useState<typeof orders[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cash">("upi");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [isNetworkRestoring, setIsNetworkRestoring] = useState(false);
  const [isOutageSimulating, setIsOutageSimulating] = useState(false);

  // Common retail products
  const sampleProducts = [
    { name: "Solar Irrigation Pump", category: "Pumps" },
    { name: "Soil Humidity Sensor Probe", category: "Sensors" },
    { name: "Wheat Seed Case (50kg)", category: "Seeds" },
    { name: "Off-Grid Deep Cycle Battery", category: "Solar" },
    { name: "E-Paper Retail tags (Pack of 10)", category: "Display" }
  ];

  // Log in user helper
  const handleLogin = (role: "customer" | "supplier") => {
    setUserRole(role);
    setShowSettings(false);
    
    // Set initial profile states based on role
    if (role === "customer") {
      const shopName = signupForm.shopName || "Balaji Village Cooperatives";
      setProfileName(signupForm.name || "Balaji Village Retailer");
      setProfileEmail(signupForm.email || "customer@ruralsync.com");
      setProfileLocation("Balaji Village Terminal, Sector 4");
      setProfileShopName(shopName);
      setOrderForm(prev => ({ ...prev, shopName }));
    } else {
      setProfileName(signupForm.name || "Central Supply Admin");
      setProfileEmail(signupForm.email || "supplier@ruralsync.com");
      setProfileLocation("Urban Central Logistics Hub");
      setProfileShopName("Urban Central Logistics Hub");
    }
    
    addNotification(`Logged in as ${role === "customer" ? "Rural Customer" : "Urban Supplier"}`, "success");
  };

  // Log out helper
  const handleLogout = () => {
    setUserRole("guest");
    setLoginRole("none");
    setLoginForm({ email: "", password: "" });
    addNotification("Logged out successfully", "info");
  };

  // Login form submit handler
  const handleLoginFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email) {
      addNotification("Please enter an email address", "warning");
      return;
    }
    const targetRole = loginRole === "supplier" ? "supplier" : "customer";
    handleLogin(targetRole);
  };

  // Signup form submit handler
  const handleSignupFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      addNotification("Please fill in all fields", "warning");
      return;
    }
    const targetRole = loginRole === "supplier" ? "supplier" : "customer";
    handleLogin(targetRole);
    addNotification(`Account registered! Welcome, ${signupForm.name}.`, "success");
  };

  // Submit order from form
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.productName) {
      addNotification("Please select or enter a product", "warning");
      return;
    }
    if (!orderForm.shopName) {
      addNotification("Please enter your shop name", "warning");
      setIsSubmitLoading(false);
      return;
    }
    setIsSubmitLoading(true);
    // Customer places order: retailerName comes from the shop name they entered
    const placedOrder = await addOrder(
      orderForm.productName,
      orderForm.quantity,
      orderForm.shopName,
      orderForm.priority,
      false,
      orderForm.notes,
      orderForm.pricePerUnit
    );
    setIsSubmitLoading(false);
    setOrderForm({ productName: "", quantity: 1, priority: "Medium", shopName: profileShopName, notes: "", pricePerUnit: 1500 });
    setCustomerTab("tracking"); // navigate to tracking page
  };

  // Auto-price helper matching server logic
  const autoPricePerUnit = (name: string): number => {
    const n = name.toLowerCase();
    if (n.includes("pump")) return 8500;
    if (n.includes("battery") || n.includes("solar")) return 12000;
    if (n.includes("sensor") || n.includes("probe")) return 2200;
    if (n.includes("seed") || n.includes("wheat") || n.includes("rice")) return 850;
    if (n.includes("fertilizer") || n.includes("phosphate") || n.includes("fertiliser")) return 1100;
    if (n.includes("gate") || n.includes("gateway") || n.includes("lora") || n.includes("module")) return 9500;
    if (n.includes("pipe") || n.includes("drip") || n.includes("irrig")) return 3200;
    if (n.includes("controller")) return 6800;
    if (n.includes("label") || n.includes("tag") || n.includes("e-paper")) return 450;
    if (n.includes("meter") || n.includes("ferti")) return 3500;
    return 1500;
  };

  // Fill sample product
  const fillSampleProduct = (name: string) => {
    setOrderForm(prev => ({ ...prev, productName: name, pricePerUnit: autoPricePerUnit(name) }));
  };

  // Hardware button click generator
  const handleHardwareGPIONode = async () => {
    const products = ["ESP32 Probe Node", "Smart Flowmeter", "Autonomous Seed Injector", "LoRa Retail Node"];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const priorities: ("Low" | "Medium" | "High")[] = ["Low", "Medium", "High"];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    
    addNotification("ESP32 GPIO 12 Button Click Registered", "info");
    await addOrder(randomProduct, 1, "Balaji Village Cooperatives", randomPriority, true, "Triggered via ESP32 GPIO 12 push button");
  };

  // Pay order click handler
  const handlePayOrder = async (id: string) => {
    setIsActionLoading(id);
    await payOrder(id);
    setIsActionLoading(null);
  };

  // Approve order handler — always opens payment popup after accepting
  const handleApproveOrder = async (id: string) => {
    setIsActionLoading(id);
    const orderToApprove = orders.find(o => o.id === id);
    await approveOrder(id);
    setIsActionLoading(null);
    // Always open the payment request popup after accepting any order
    if (orderToApprove) setPaymentRequestOrder(orderToApprove);
  };

  // Dispatch order handler
  const handleDispatchOrder = async (id: string) => {
    setIsActionLoading(id);
    await dispatchOrder(id);
    setIsActionLoading(null);
  };

  // Deliver order handler
  const handleDeliverOrder = async (id: string) => {
    setIsActionLoading(id);
    await deliverOrder(id);
    setIsActionLoading(null);
  };

  // Helper values for calculations
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "Pending" || o.status === "Buffered Offline" || o.status === "Proposed").length;
  const offlineOrdersCount = orders.filter(o => o.status === "Buffered Offline").length;
  const syncedOrders = orders.filter(o => o.status !== "Buffered Offline" && o.status !== "Proposed").length;
  const pendingPaymentCount = orders.filter(o => o.status === "Payment Pending").length;

  // Supplier portal stats
  const supplierOrdersCount = orders.length;
  const pendingApprovalCount = orders.filter(o => o.status === "Synced" || o.status === "Proposed").length;
  const approvedOrdersCount = orders.filter(o => o.status !== "Synced" && o.status !== "Proposed" && o.status !== "Buffered Offline").length;
  const deliveredOrdersCount = orders.filter(o => o.status === "Delivered").length;
  const calculatedRevenue = useMemo(() => {
    return orders
      .filter(o => o.status !== "Synced" && o.status !== "Proposed" && o.status !== "Buffered Offline")
      .reduce((sum, o) => sum + ((o.pricePerUnit ?? 1500) * o.quantity), 0);
  }, [orders]);

  // Order status flow badge renderer
  const renderStatusBadge = (status: Order["status"]) => {
    let colorClass = "bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    if (status === "Buffered Offline") {
      colorClass = "bg-amber-150 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-500/20";
    } else if (status === "Synced") {
      colorClass = "bg-blue-150 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-500/20";
    } else if (status === "Payment Pending") {
      colorClass = "bg-purple-150 text-purple-650 dark:bg-purple-500/10 dark:text-purple-400 border-purple-500/20 animate-pulse";
    } else if (status === "Paid") {
      colorClass = "bg-emerald-150 text-[#10B981] dark:bg-emerald-500/10 dark:text-[#10B981] border-emerald-500/20";
    } else if (status === "In Transit") {
      colorClass = "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20";
    } else if (status === "Delivered") {
      colorClass = "bg-teal-500/10 text-teal-400 border-teal-500/25";
    } else if (status === "Proposed") {
      colorClass = "bg-orange-100 dark:bg-orange-500/10 text-orange-400 border-orange-500/20";
    }

    return (
      <span className={`px-2.5 py-0.8 rounded-full text-[9px] font-bold font-mono tracking-wide border uppercase inline-block ${colorClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 font-sans antialiased overflow-hidden transition-colors duration-300 relative">
      
      {/* Background Ambient Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-blue/5 dark:bg-brand-blue/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-purple/5 dark:bg-brand-purple/10 blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {userRole === "guest" && loginRole === "none" ? (
          /* PORTAL GATEWAY SELECTOR */
          <motion.div
            key="gateway-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative z-10"
          >
            {/* Header / Logo */}
            <div className="flex items-center gap-3.5 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white shadow-xl shadow-brand-purple/20">
                <Zap className="w-6 h-6 fill-current animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-brand-purple dark:text-brand-violet font-mono font-bold tracking-widest leading-none block uppercase">
                  Resilient IoT Link
                </span>
                <span className="text-2xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                  RuralSync
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center max-w-xl mb-12 space-y-3">
              <h2 className="text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight leading-none animate-in fade-in slide-in-from-top-4 duration-500">
                Select Your Portal Gateway
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Choose a dedicated portal below to sign in or register an account.
              </p>
            </div>

            {/* Portal Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[840px]">
              
              {/* Customer Portal Card */}
              <button
                type="button"
                onClick={() => {
                  setLoginRole("customer");
                  setAuthMode("login");
                }}
                className="bg-white dark:bg-[#1E293B] hover:scale-[1.02] border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40 rounded-3xl p-8 shadow-lg hover:shadow-amber-500/5 transition-all text-left flex flex-col justify-between min-h-[300px] cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center shadow-sm">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div className="space-y-2.5">
                    <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2 group-hover:text-amber-500 transition-colors">
                      <span>Rural Customer Portal</span>
                      <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Designed for village merchants, retailers, and rural clients to place product orders, track transit progress, queue requests offline, and monitor ESP32 connectivity.
                    </p>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-mono">
                  <span>Enter Customer Portal</span>
                  <span>→</span>
                </div>
              </button>

              {/* Supplier Portal Card */}
              <button
                type="button"
                onClick={() => {
                  setLoginRole("supplier");
                  setAuthMode("login");
                }}
                className="bg-white dark:bg-[#1E293B] hover:scale-[1.02] border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-purple/40 rounded-3xl p-8 shadow-lg hover:shadow-brand-purple/5 transition-all text-left flex flex-col justify-between min-h-[300px] cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 rounded-full blur-2xl pointer-events-none group-hover:bg-brand-purple/10 transition-colors" />
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-brand-purple/10 text-brand-purple rounded-2xl flex items-center justify-center shadow-sm">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="space-y-2.5">
                    <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2 group-hover:text-brand-purple transition-colors">
                      <span>Urban Supplier Portal</span>
                      <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Designed for urban wholesale suppliers, distributors, and logistics managers to view incoming orders, process transit dispatches, and examine sales analytics.
                    </p>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs font-bold text-brand-purple dark:text-brand-violet uppercase tracking-wider font-mono">
                  <span>Enter Supplier Portal</span>
                  <span>→</span>
                </div>
              </button>

            </div>
          </motion.div>
        ) : userRole === "guest" ? (
          /* SPLIT-SCREEN LOGIN VIEW */
          <motion.div
            key="login-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen flex flex-col lg:flex-row relative z-10"
          >
            {/* Left Pane: Login Card Form */}
            <div className="w-full lg:w-[42%] bg-white dark:bg-[#0F172A] flex flex-col justify-between p-8 md:p-12 lg:p-16 relative z-10 transition-colors duration-300">
              {/* Logo / Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white shadow-lg shadow-brand-purple/20">
                  <Zap className="w-5 h-5 fill-current animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] text-brand-purple dark:text-brand-violet font-mono font-bold tracking-widest leading-none block uppercase">
                    Resilient IoT Link
                  </span>
                  <span className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                    RuralSync
                  </span>
                </div>
              </div>

              {/* Main Auth Form Block */}
              <div className="my-auto py-6 w-full max-w-[380px] mx-auto space-y-5">
                {authMode === "login" ? (
                  <>
                    <div>
                      <h2 className="text-3xl font-extrabold font-display text-slate-955 dark:text-white tracking-tight capitalize">
                        {loginRole} Login
                      </h2>
                      <p className="text-xs text-slate-450 dark:text-slate-500 mt-2 font-medium">
                        Enter your credentials below to access the {loginRole === "customer" ? "Rural Customer" : "Urban Supplier"} portal.
                      </p>
                    </div>

                    {/* Form Fields */}
                    <form onSubmit={handleLoginFormSubmit} className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          placeholder={loginRole === "customer" ? "customer@ruralsync.com" : "supplier@ruralsync.com"}
                          value={loginForm.email}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-purple rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
                            Password
                          </label>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="••••••••"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-purple rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Keep logged / Forgot links */}
                      <div className="flex items-center justify-between text-xs pt-1 select-none">
                        <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="rounded border-slate-350 dark:border-slate-800 accent-brand-purple w-4 h-4 cursor-pointer"
                          />
                          <span>Keep me logged in</span>
                        </label>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); addNotification("Simulated password reset email sent", "info"); }}
                          className="text-brand-purple hover:underline font-semibold"
                        >
                          Forgot password?
                        </a>
                      </div>

                      {/* Primary Login Button */}
                      <button
                        type="submit"
                        className="w-full bg-brand-purple hover:opacity-95 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-brand-purple/25 cursor-pointer mt-4 flex items-center justify-center gap-1.5"
                      >
                        <span>Login</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div>
                      <h2 className="text-3xl font-extrabold font-display text-slate-955 dark:text-white tracking-tight capitalize">
                        Create {loginRole} Account
                      </h2>
                      <p className="text-xs text-slate-450 dark:text-slate-500 mt-2 font-medium">
                        Enter your information below to register your profile.
                      </p>
                    </div>

                    {/* SignUp Form */}
                    <form onSubmit={handleSignupFormSubmit} className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={signupForm.name}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-purple rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                        />
                      </div>

                      {loginRole === "customer" && (
                        <div>
                          <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1">
                            Shop / Store Name
                          </label>
                          <input
                            type="text"
                            required={loginRole === "customer"}
                            placeholder="e.g. Balaji Village Cooperatives"
                            value={signupForm.shopName}
                            onChange={(e) => setSignupForm(prev => ({ ...prev, shopName: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-purple rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder={loginRole === "customer" ? "customer@ruralsync.com" : "supplier@ruralsync.com"}
                          value={signupForm.email}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-purple rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="••••••••"
                            value={signupForm.password}
                            onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-purple rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Primary Signup Button */}
                      <button
                        type="submit"
                        className="w-full bg-brand-purple hover:opacity-95 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-brand-purple/25 cursor-pointer mt-4 flex items-center justify-center gap-1.5"
                      >
                        <span>Create Account</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </>
                )}
              </div>

              {/* Bottom Footer Signup/Login toggle */}
              <div className="text-center text-xs text-slate-450 dark:text-slate-500 font-medium space-y-4">
                <div>
                  {authMode === "login" ? (
                    <>
                      <span>Don't have an account? </span>
                      <button
                        type="button"
                        onClick={() => setAuthMode("signup")}
                        className="text-brand-purple hover:underline font-bold bg-transparent border-none p-0 cursor-pointer"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      <span>Already have an account? </span>
                      <button
                        type="button"
                        onClick={() => setAuthMode("login")}
                        className="text-brand-purple hover:underline font-bold bg-transparent border-none p-0 cursor-pointer"
                      >
                        Login
                      </button>
                    </>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-150 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setLoginRole("none")}
                    className="text-slate-500 hover:text-brand-purple font-semibold bg-transparent border-none p-0 cursor-pointer text-xs flex items-center justify-center gap-1.5 mx-auto transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Portal Selection</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Pane: Abstract Geometric Visuals */}
            <div className="hidden lg:flex lg:w-[58%] bg-white dark:bg-slate-900 border-l border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden flex-col justify-between p-16 select-none transition-colors duration-300">
              
              {/* Dot Pattern Background Overlay */}
              <div className="absolute inset-0 bg-dot-pattern pointer-events-none" />

              {/* Glowing Background Blur Orbs */}
              <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-brand-purple/10 dark:bg-brand-purple/20 blur-[140px] pointer-events-none" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 blur-[120px] pointer-events-none" />

              {/* Floating Geometric Abstract Art shapes */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Large Purple Circle (Top Right) */}
                <div className="w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-brand-purple/40 to-brand-blue/15 absolute -top-20 -right-20 animate-pulse duration-[8000ms]" />

                {/* Pinkish/Rose Soft Gradient Circle (Left Center) */}
                <div className="w-80 h-80 rounded-full bg-gradient-to-tr from-pink-500/20 to-rose-450/5 blur-circle absolute top-1/3 -left-12" />

                {/* Semicircles (Bottom center and center-right) */}
                {/* Semicircle Coral-Orange */}
                <div className="w-56 h-28 bg-gradient-to-t from-red-500/90 to-amber-500/90 rounded-t-full absolute bottom-12 left-[30%] rotate-[18deg] shadow-lg shadow-red-500/10" />

                {/* Semicircle Sky Blue */}
                <div className="w-64 h-32 bg-gradient-to-t from-sky-400 to-cyan-500 rounded-t-full absolute -bottom-10 right-28 -rotate-[35deg] shadow-lg shadow-sky-400/10" />

                {/* Organic Triangly Blob (Middle Right) */}
                <svg className="w-64 h-64 absolute right-16 top-1/2 -translate-y-1/3 text-brand-purple/25 animate-pulse duration-[12000ms] drop-shadow-2xl" viewBox="0 0 200 200">
                  <path fill="currentColor" d="M40,160 Q20,130 80,40 Q140,20 170,80 Q190,140 100,170 Q50,180 40,160 Z" />
                </svg>

                {/* Grid Overlay Dotted Block */}
                <div className="absolute right-28 top-1/4 w-36 h-36 bg-dot-pattern opacity-70" />
              </div>

              {/* Small Right Header */}
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest relative z-10 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                <span>Simulation Platform Active</span>
              </div>

              {/* Large Central Tagline */}
              <div className="relative z-10 my-auto max-w-lg space-y-6">
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                  Changing the way the world <span className="bg-gradient-to-r from-brand-purple via-brand-violet to-brand-blue bg-clip-text text-transparent">syncs.</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 max-w-sm leading-relaxed font-sans">
                  RuralSync maps low-cost ESP32 edge gateways to urban supply networks, protecting critical inventory transactions during network blackouts.
                </p>
              </div>

              {/* Right Footer Info */}
              <div className="flex items-center justify-between relative z-10">
                <span className="text-[10px] text-slate-400 dark:text-slate-550 font-mono">
                  v2.0 • Dual-Portal Matrix
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-550 font-mono">
                  Secure Edge Sync
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ZARAGOZA PORTAL CONTAINER */
          <motion.div
            key="portal-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-screen p-4 md:p-6 bg-[#7F5AF0] dark:bg-[#0b0f19] transition-colors duration-500 flex items-center justify-center relative z-10"
          >
            {/* Inner Dashboard Wrapper */}
            <div className="flex w-full h-full max-w-[1400px] gap-4 md:gap-6 overflow-hidden">
              
              {/* Portal-Wide Sidebar Navigation */}
              <aside className="w-72 shrink-0 bg-white/95 dark:bg-[#1E293B]/90 backdrop-blur-xl border border-slate-200/20 dark:border-slate-800/40 rounded-3xl p-6 flex flex-col justify-between shadow-2xl transition-all duration-300">
                <div>
                  {/* Logo Brand */}
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-tr from-brand-purple to-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-purple/20">
                      <Zap className="w-5 h-5 fill-current animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[9px] text-brand-purple dark:text-brand-violet font-mono font-bold tracking-widest leading-none block uppercase">
                        Resilient IoT Link
                      </span>
                      <h1 className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                        RuralSync
                      </h1>
                    </div>
                  </div>

                  {/* Portal Switcher info in Sidebar */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-3 mb-5 border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Active Portal</span>
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg ${userRole === "customer" ? "bg-amber-500/10 text-amber-500" : "bg-brand-blue/10 text-brand-blue"}`}>
                        {userRole === "customer" ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white capitalize">
                        {userRole} Portal
                      </span>
                    </div>
                  </div>

            {/* Navigation options depending on userRole */}

            {userRole === "customer" && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block px-3 mb-2">
                  Customer Controls
                </span>

                {([
                  { id: "dashboard" as const, label: "Client Dashboard", icon: Layers, badgeColor: undefined },
                  { id: "create-order" as const, label: "Place Product Order", icon: PlusCircle, badgeColor: undefined },
                  { id: "tracking" as const, label: "Order Tracking", icon: ShoppingBag, badge: pendingPaymentCount > 0 ? pendingPaymentCount : undefined, badgeColor: "amber" },
                  { id: "queue" as const, label: "Offline Queue", icon: Database, badge: pendingOrders > 0 ? pendingOrders : undefined, badgeColor: undefined },
                  { id: "esp32" as const, label: "ESP32 Device Monitor", icon: Cpu, badgeColor: undefined },
                  { id: "profile" as const, label: "My Profile", icon: User, badgeColor: undefined }
                ] as { id: "dashboard" | "create-order" | "tracking" | "queue" | "esp32" | "profile"; label: string; icon: any; badge?: number; badgeColor?: string }[]).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = customerTab === tab.id && !showSettings;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setCustomerTab(tab.id);
                        setShowSettings(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-r from-amber-500/10 to-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40 border border-transparent"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-amber-500" : "text-slate-400 dark:text-slate-500"}`} />
                        <span>{tab.label}</span>
                      </span>
                      {tab.badge && (
                        <span className={`font-bold font-mono text-[10px] px-2 py-0.5 rounded-full shadow-inner animate-pulse ${
                          tab.badgeColor === "amber"
                            ? "bg-amber-500 text-white"
                            : "bg-amber-500 text-slate-950"
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {userRole === "supplier" && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block px-3 mb-2">
                  Supplier Panel
                </span>

                {([
                  { id: "dashboard" as const, label: "Executive Dashboard", icon: Layers, badgeColor: undefined },
                  { id: "incoming" as const, label: "Incoming Orders", icon: ListOrdered, badge: pendingApprovalCount > 0 ? pendingApprovalCount : undefined, badgeColor: undefined },
                  { id: "dispatch" as const, label: "Dispatch Logistics", icon: Truck, badgeColor: undefined },
                  { id: "analytics" as const, label: "SaaS Analytics", icon: BarChart3, badgeColor: undefined },
                  { id: "profile" as const, label: "My Profile", icon: User, badgeColor: undefined }
                ] as { id: "dashboard" | "incoming" | "dispatch" | "analytics" | "profile"; label: string; icon: any; badge?: number; badgeColor?: string }[]).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = supplierTab === tab.id && !showSettings;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setSupplierTab(tab.id);
                        setShowSettings(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-r from-brand-blue/10 to-brand-blue/20 text-brand-blue dark:text-brand-blue border border-brand-blue/25 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40 border border-transparent"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-brand-blue" : "text-slate-400 dark:text-slate-500"}`} />
                        <span>{tab.label}</span>
                      </span>
                      {tab.badge && (
                        <span className="bg-brand-blue text-white font-bold font-mono text-[10px] px-2 py-0.5 rounded-full shadow-inner animate-pulse">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Footer controls */}
          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            {userRole !== "guest" && (
              <button
                onClick={handleLogout}
                className="w-full bg-slate-100 hover:bg-red-500/10 dark:bg-slate-800 dark:hover:bg-red-950/20 text-slate-600 dark:text-slate-400 hover:text-[#EF4444] py-2 px-3 rounded-xl border border-slate-200/50 dark:border-slate-750 transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out Portal</span>
              </button>
            )}

            {/* Toggle Theme + Settings Gear */}
            <div className="flex items-center justify-between gap-2">
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

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  showSettings
                    ? "bg-brand-purple/10 text-brand-purple border-brand-purple/20"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-750"
                }`}
                title="System Setup"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace Frame */}
        <main className="flex-1 bg-white dark:bg-[#1E293B] border border-slate-200/20 dark:border-slate-800/30 rounded-3xl flex flex-col overflow-hidden shadow-xl transition-all duration-300 animate-in fade-in zoom-in-95 duration-350">
          
          {/* Header */}
          <header className="h-20 border-b border-slate-100 dark:border-slate-800/85 bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur-md shrink-0 flex items-center justify-between px-8 z-20">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest select-none font-display">
                {showSettings ? "System Setup" : `${userRole} Portal`}
              </span>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
              
              {/* Connection Status Badge */}
              <div
                className={`text-[11px] px-3.5 py-1.5 rounded-full font-bold border flex items-center gap-2 select-none transition-all duration-300 ${
                  userRole === "supplier" || isInternetAvailable
                    ? "text-[#10B981] bg-emerald-500/10 border-emerald-500/20"
                    : "text-[#EF4444] bg-red-500/10 border-red-500/20"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  userRole === "supplier" || isInternetAvailable
                    ? "bg-[#10B981] animate-pulse"
                    : "bg-[#EF4444] animate-bounce"
                }`} />
                <span>
                  {userRole === "supplier"
                    ? "CLOUD ENDPOINT ONLINE"
                    : isInternetAvailable
                    ? "CLOUD ENDPOINT ONLINE"
                    : "OUTAGE PROTOCOL INJECTED • LOCAL BUFFER"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">

              {/* Profile Avatar Button */}
              <button
                onClick={() => {
                  if (userRole === "customer") setCustomerTab("profile");
                  if (userRole === "supplier") setSupplierTab("profile");
                  setShowSettings(false);
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[11px] shadow-sm transition-all cursor-pointer select-none text-white bg-gradient-to-tr ${
                  userRole === "customer"
                    ? "from-amber-500 to-amber-600 shadow-amber-500/10 hover:from-amber-500/90 hover:to-amber-600/90"
                    : "from-brand-blue to-brand-purple shadow-brand-blue/10 hover:from-brand-blue/90 hover:to-brand-purple/90"
                }`}
                title="My Profile"
              >
                {profileName ? profileName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "ME"}
              </button>
            </div>
          </header>

          {/* Body Viewport */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            
            {/* Show Settings Tab Overlay */}
            {showSettings ? (
              <motion.div
                key="tab-settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
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
                        <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3 shadow-inner">
                          <label className="text-xs font-bold text-slate-750 dark:text-slate-250 block">
                            Heartbeat Polling Interval (ms)
                          </label>
                          <input
                            type="number"
                            defaultValue="10000"
                            title="Heartbeat Polling Interval (ms)"
                            placeholder="e.g. 10000"
                            aria-label="Heartbeat Polling Interval (ms)"
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3 shadow-inner">
                          <label className="text-xs font-bold text-slate-750 dark:text-slate-250 block">
                            Failover Flash Partition Format
                          </label>
                          <select
                            title="Failover Flash Partition Format"
                            aria-label="Failover Flash Partition Format"
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-755 cursor-pointer focus:outline-none dark:text-slate-350"
                          >
                            <option>LittleFS Flash Sector Cluster Map (Default)</option>
                            <option>FAT32 SD Card Array Partition</option>
                            <option>EEPROM Raw Direct Byte Stack</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-brand-purple/5 dark:bg-brand-purple/10 border border-brand-purple/20 p-5 rounded-2xl text-brand-purple dark:text-brand-violet space-y-2">
                        <h4 className="text-sm font-bold font-display text-slate-900 dark:text-white">C++ Edge Node Firmware (Arduino Sketch)</h4>
                        <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-400">
                          This sketch is fully compatible with ESP-IDF compiler packages or Arduino IDE sketch compiler. It sets up the Wi-Fi heartbeats, local storage buffering inside LittleFS during outages, and handles automatic cloud sync pushes once connection handshakes return.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : userRole === "customer" ? (
              /* RURAL CUSTOMER PORTAL INTERFACE */
              <motion.div
                key="customer-portal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* 1. Dashboard View */}
                {customerTab === "dashboard" && (
                  <div className="space-y-8">
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/50 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover-lift">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Orders</span>
                        <span className="text-2xl font-bold font-display block mt-1">{totalOrders}</span>
                      </div>
                      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/50 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover-lift">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Pending Approval</span>
                        <span className="text-2xl font-bold font-display block mt-1 text-purple-500">{pendingOrders}</span>
                      </div>
                      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/50 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover-lift">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Stored Offline</span>
                        <span className={`text-2xl font-bold font-display block mt-1 ${offlineOrdersCount > 0 ? "text-amber-500 animate-bounce" : ""}`}>{offlineOrdersCount}</span>
                      </div>
                      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/50 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover-lift">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Synced to Cloud</span>
                        <span className="text-2xl font-bold font-display block mt-1 text-[#10B981]">{syncedOrders}</span>
                      </div>
                      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/50 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover-lift">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Cloud Status</span>
                        <span className="text-xs font-bold font-mono uppercase block mt-2 text-[#10B981]">
                          🟢 CONNECTED
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Quick actions and instructions */}
                      <div className="space-y-6">
                        <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 font-display">
                            Rural Edge Operations Manager
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                            This portal simulates village merchants submitting orders. To test failover, select **Demo Simulation** in the sidebar, disconnect the network towers, and watch how orders route instantly to LittleFS buffer memory.
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={() => setCustomerTab("create-order")}
                              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                            >
                              <PlusCircle className="w-4 h-4" />
                              <span>Place New Order</span>
                            </button>
                            <button
                              onClick={() => setCustomerTab("tracking")}
                              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer text-center"
                            >
                              Track Orders
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Recent Events logs for customer */}
                      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm max-h-[300px] overflow-y-auto custom-scrollbar">
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-3 font-display">Telemetry Heartbeats</h4>
                        <div className="space-y-2 text-xs">
                          {events.slice(0, 8).map(evt => (
                            <div key={evt.id} className="flex justify-between items-center text-slate-500 font-mono py-1 border-b border-slate-100 dark:border-slate-850 last:border-0">
                              <span>{evt.event}</span>
                              <span className="text-[10px] shrink-0 ml-4">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Create Order Form */}
                {customerTab === "create-order" && (
                  <div className="max-w-xl mx-auto bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-base font-bold font-display text-slate-900 dark:text-white mb-5 pb-3 border-b border-slate-100 dark:border-slate-850">
                      Create Village Retail Order
                    </h3>

                    <form onSubmit={handleOrderSubmit} className="space-y-4">
                      {/* Shop Name */}
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                          Your Shop / Store Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Balaji Village Cooperatives"
                          value={orderForm.shopName}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, shopName: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                          Product Name / Description
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Solar Irrigation Pump"
                          value={orderForm.productName}
                          onChange={(e) => {
                            const name = e.target.value;
                            setOrderForm(prev => ({ ...prev, productName: name, pricePerUnit: autoPricePerUnit(name) }));
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all shadow-inner"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="1000"
                            required
                            title="Quantity"
                            placeholder="e.g. 5"
                            aria-label="Quantity"
                            value={orderForm.quantity}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all font-mono shadow-inner"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                            Price per Unit (₹)
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            title="Price per Unit (₹)"
                            placeholder="e.g. 1500"
                            aria-label="Price per Unit (₹)"
                            value={orderForm.pricePerUnit}
                            onChange={(e) => setOrderForm(prev => ({ ...prev, pricePerUnit: Number(e.target.value) }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all font-mono shadow-inner"
                          />
                        </div>
                      </div>

                      {/* Live total preview */}
                      {orderForm.productName && (
                        <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl px-4 py-2.5">
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">Order Total</span>
                          <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                            ₹{(orderForm.pricePerUnit * orderForm.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                          Priority
                        </label>
                        <select
                          value={orderForm.priority}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, priority: e.target.value as "Low" | "Medium" | "High" }))}
                          title="Priority"
                          aria-label="Priority"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-350 focus:outline-none focus:border-amber-500 transition-all cursor-pointer font-medium shadow-inner"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                          Additional Notes / Delivery Dispatch Instructions
                        </label>
                        <textarea
                          placeholder="e.g. Please wrap in plastic, deliver near temple well"
                          value={orderForm.notes}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                          rows={3}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all shadow-inner"
                        />
                      </div>

                      {/* Suggestions */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] text-slate-400 font-mono block">Product Suggestions:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {sampleProducts.map((p) => (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => fillSampleProduct(p.name)}
                              className="text-[10px] bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-300 px-2.5 py-1.2 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-800 cursor-pointer"
                            >
                              + {p.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-150 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 leading-normal max-w-[280px]">
                          Note: Orders submitted offline are stored in ESP32 sectors.
                        </p>
                        <button
                          type="submit"
                          disabled={isSubmitLoading}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                          {isSubmitLoading ? "Submitting..." : "Place Order"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 3. Order Tracking Screen */}
                {customerTab === "tracking" && (
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                        Transaction Tracking Ledger
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                        Track progress of your deliveries from rural edge gateway sync to urban dispatch.
                      </p>
                    </div>

                    {/* Payment Request Alert Banner */}
                    {pendingPaymentCount > 0 && (
                      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                            <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-amber-700 dark:text-amber-300">
                              {pendingPaymentCount} Payment Request{pendingPaymentCount > 1 ? "s" : ""} Awaiting
                            </p>
                            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/70 mt-0.5">
                              Your supplier has approved your order(s) and is requesting payment.
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-full shrink-0 uppercase tracking-wide">
                          Action Required
                        </span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {orders.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                          <Inbox className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-650" />
                          <p className="text-xs italic">No orders logged in system</p>
                        </div>
                      ) : (
                        orders.map((order) => {
                          const isOffline = order.storageLocation === "ESP32 Local Buffer";
                          const isPaymentPending = order.status === "Payment Pending";
                          return (
                            <div
                              key={order.id}
                              className={`rounded-2xl border overflow-hidden transition-all duration-300 shadow-sm ${
                                isPaymentPending
                                  ? "border-amber-300/60 dark:border-amber-500/30 shadow-amber-500/10 shadow-md"
                                  : isOffline
                                  ? "border-orange-200/70 dark:border-orange-700/30"
                                  : "border-blue-200/60 dark:border-blue-800/30"
                              }`}
                            >
                              {/* Colour-coded origin header strip */}
                              <div className={`px-5 py-2.5 flex items-center justify-between ${
                                isOffline
                                  ? "bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/10 dark:to-amber-500/5 border-b border-orange-200/50 dark:border-orange-700/20"
                                  : "bg-gradient-to-r from-blue-500/8 to-sky-500/8 dark:from-blue-500/8 dark:to-sky-500/5 border-b border-blue-200/40 dark:border-blue-800/20"
                              }`}>
                                <div className="flex items-center gap-2">
                                  <span className={`text-base leading-none`}>{isOffline ? "📡" : "☁️"}</span>
                                  <div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                      isOffline ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"
                                    }`}>
                                      {isOffline ? "Offline Order" : "Online Order"}
                                    </span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2">
                                      {isOffline ? "Placed via ESP32 local buffer · synced later" : "Placed directly to cloud"}
                                    </span>
                                  </div>
                                </div>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                  isOffline
                                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                }`}>
                                  {isOffline ? "ESP32 Buffer" : "Cloud Direct"}
                                </span>
                              </div>

                              {/* Card Body */}
                              <div className={`p-5 space-y-4 ${
                                isPaymentPending
                                  ? "bg-amber-50 dark:bg-amber-500/5"
                                  : isOffline
                                  ? "bg-orange-50/40 dark:bg-orange-950/10"
                                  : "bg-white dark:bg-slate-900/40"
                              }`}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-150 dark:border-slate-850 pb-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-200 dark:bg-slate-850 px-2 py-0.5 rounded">
                                      {order.orderId}
                                    </span>
                                    <h4 className="font-bold text-slate-850 dark:text-white text-sm">{order.productName}</h4>
                                    <span className="text-[10px] text-slate-400">(Qty: {order.quantity})</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {renderStatusBadge(order.status)}
                                    {isPaymentPending && (
                                      <button
                                        onClick={() => {
                                          setCustomerPaymentOrder(order);
                                          setPaymentMethod("upi");
                                        }}
                                        disabled={isActionLoading === order.id}
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white font-black py-1.5 px-4 rounded-lg text-[10px] transition-all cursor-pointer shadow-lg shadow-amber-500/25 flex items-center gap-1.5 animate-pulse"
                                      >
                                        <CreditCard className="w-3.5 h-3.5" />
                                        Pay Now
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {order.notes && (
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                    Notes: "{order.notes}"
                                  </div>
                                )}

                                {/* Progress stepper */}
                                <div className={`grid gap-2 pt-1 ${
                                  isOffline ? "grid-cols-2 md:grid-cols-7" : "grid-cols-2 md:grid-cols-6"
                                }`}>
                                  {(isOffline
                                    ? [
                                        { name: "Created", label: "Created" },
                                        { name: "Buffered Offline", label: "📡 Buffered" },
                                        { name: "Synced", label: "Synced" },
                                        { name: "Approved", label: "Accepted" },
                                        { name: "Payment Pending", label: "Pay Request" },
                                        { name: "Paid", label: "Paid" },
                                        { name: "Delivered", label: "Delivered" }
                                      ]
                                    : [
                                        { name: "Synced", label: "☁ Received" },
                                        { name: "Approved", label: "Accepted" },
                                        { name: "Payment Pending", label: "Pay Request" },
                                        { name: "Paid", label: "Paid" },
                                        { name: "In Transit", label: "Shipped" },
                                        { name: "Delivered", label: "Delivered" }
                                      ]
                                  ).map((step, idx) => {
                                    const allStates = ["Created", "Buffered Offline", "Synced", "Approved", "Payment Pending", "Paid", "In Transit", "Delivered"];
                                    const currentIdx = allStates.indexOf(order.status);
                                    const targetIdx = allStates.indexOf(step.name);
                                    const isDone = currentIdx >= targetIdx && targetIdx !== -1;
                                    return (
                                      <div key={idx} className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/40 dark:border-slate-900 shadow-sm text-center">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                          isDone
                                            ? isOffline ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-450"
                                        }`}>
                                          {isDone ? "✓" : idx + 1}
                                        </div>
                                        <span className="text-[9px] font-semibold mt-1 text-slate-500 dark:text-slate-400 truncate max-w-[72px] leading-tight">
                                          {step.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Offline Queue View */}
                {customerTab === "queue" && (
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="pb-4 mb-5 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                          ESP32 Offline Storage Partition (/littlefs)
                        </h3>
                        <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
                          Orders stored inside local sector arrays due to telecom cuts. Pushes automatically when signal returns.
                        </p>
                      </div>
                      <button
                        onClick={triggerSync}
                        className="bg-brand-purple hover:bg-brand-purple/95 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow cursor-pointer transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Force Auto Sync</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Buffered Orders */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-850">
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                          LittleFS Active File explorer: /orders.txt
                        </h4>

                        <div className="space-y-3">
                          {orders.filter(o => o.status === "Buffered Offline" || o.status === "Proposed" || o.status === "Pending").length === 0 ? (
                            <p className="text-xs text-slate-450 dark:text-slate-500 italic text-center py-10">
                              No records buffered on flash. orders.txt has been truncated or synchronized.
                            </p>
                          ) : (
                            orders
                              .filter(o => o.status === "Buffered Offline" || o.status === "Proposed" || o.status === "Pending")
                              .map((ord, idx) => (
                                <div key={ord.id} className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-900 text-xs font-mono flex items-center justify-between shadow-sm">
                                  <div className="min-w-0 pr-2">
                                    <span className="text-amber-500 font-bold block mb-1">[{idx + 1}] BUFFER SECTOR</span>
                                    <p className="text-slate-800 dark:text-slate-200 truncate font-semibold">ID: {ord.orderId} | PROD: {ord.productName}</p>
                                    <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1">QTY: {ord.quantity} | PRIORITY: {ord.priority}</p>
                                  </div>
                                  <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 uppercase shrink-0">
                                    Buffered
                                  </span>
                                </div>
                              ))
                          )}
                        </div>
                      </div>

                      {/* Right: Sync logs ledger */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-850">
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                          Synchronization Ledger History
                        </h4>

                        <div className="space-y-3 max-h-[260px] overflow-y-auto custom-scrollbar">
                          {syncLogs.length === 0 ? (
                            <p className="text-xs text-slate-450 dark:text-slate-500 italic text-center py-10">
                              No historic syncs mapped yet.
                            </p>
                          ) : (
                            syncLogs.map(log => (
                              <div key={log.id} className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200/60 dark:border-slate-900 text-xs flex justify-between items-center shadow-sm">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Batch {log.id}</span>
                                  <span className="text-[10px] text-slate-450 dark:text-slate-500 block mt-0.5">{log.result}</span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="bg-emerald-500/10 text-[#10B981] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                    +{log.ordersSynced} synced
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 5. ESP32 Device Monitor Tab */}
                {customerTab === "esp32" && (
                  <div className="space-y-6">


                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Total Orders Created</span>
                        <span className="text-3xl font-black font-display text-slate-900 dark:text-white block">{totalOrders}</span>
                        <span className="text-[10px] text-emerald-500 font-bold font-mono uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                          Active DB Instances
                        </span>
                      </div>
                      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Synced to Cloud</span>
                        <span className="text-3xl font-black font-display text-slate-900 dark:text-white block">{syncedOrders}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase">Storage Location = Cloud</span>
                      </div>
                      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Unsynced Pending Queue</span>
                        <span className={`text-3xl font-black font-display block ${offlineOrdersCount > 0 ? "text-amber-500" : "text-slate-900 dark:text-white"}`}>{offlineOrdersCount}</span>
                        <span className={`text-[10px] font-bold font-mono uppercase ${offlineOrdersCount > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                          {offlineOrdersCount > 0 ? "⚠ Buffer Active" : "Clear: Buffer Synchronized"}
                        </span>
                      </div>
                      <div className="bg-gradient-to-br from-brand-purple to-brand-blue p-5 rounded-2xl shadow-lg shadow-brand-purple/15 space-y-2">
                        <span className="text-[10px] text-purple-200 uppercase font-bold tracking-wider block">ESP32 LittleFS Allocation</span>
                        <span className="text-3xl font-black font-display text-white block">{offlineOrdersCount}</span>
                        <span className="text-[10px] text-purple-200 font-bold font-mono uppercase">File: /littlefs/orders.txt</span>
                      </div>
                    </div>

                    {/* Hardware Edge Node Diagnostics */}
                    <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">Hardware Edge Node Diagnostics</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Receive real-time telemetry metrics directly from the SoC registers.</p>
                        </div>
                        <span className="text-[10px] font-mono font-black bg-brand-blue/10 text-brand-blue border border-brand-blue/20 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                          COMM PORT: COM 4
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* MCU Uptime */}
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">MCU Uptime</span>
                            <Clock className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-4xl font-black font-display text-slate-900 dark:text-white block">
                            {deviceStatus ? `${deviceStatus.uptime}s` : "—"}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Auto Heartbeat Interval: Every 10s</span>
                        </div>

                        {/* Memory Allocation */}
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Memory Allocation</span>
                            <Activity className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className={`text-4xl font-black font-display block ${deviceStatus && deviceStatus.memoryUsage > 70 ? "text-red-500" : "text-amber-500"}`}>
                            {deviceStatus ? `${deviceStatus.memoryUsage}%` : "—"}
                          </span>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              ref={(el) => { if (el) el.style.width = `${deviceStatus?.memoryUsage ?? 0}%`; }}
                              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-mono font-bold">
                            <span className="text-brand-purple">Partition Type: LittleFS</span>
                            <span className="text-emerald-500">Heap: {deviceStatus ? Math.round((1 - deviceStatus.memoryUsage / 100) * 320) : 0}KB Free</span>
                          </div>
                        </div>

                        {/* Firmware Build Target */}
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Firmware Build Target</span>
                            <Cpu className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-2xl font-black font-display text-slate-900 dark:text-white leading-tight block">
                            ESP32 v1.2.0-STABLE
                          </span>
                          <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono">Compiler: ESP-IDF v5.1 with LittleFS API</span>
                        </div>
                      </div>
                    </div>

                    {/* State Machine Status Trace */}
                    <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block mb-4">State Machine Status Trace</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          {
                            label: "RSSI Core:",
                            value: deviceStatus ? `${-55 - Math.round(deviceStatus.cpuUsage / 10)} dBm` : "—",
                            sub: deviceStatus ? (deviceStatus.cpuUsage < 30 ? "Excellent" : deviceStatus.cpuUsage < 70 ? "Good" : "Weak") : "Unknown",
                            color: "text-slate-900 dark:text-white"
                          },
                          {
                            label: "Device Status State:",
                            value: deviceStatus?.status ?? "UNKNOWN",
                            sub: null,
                            color: deviceStatus?.status === "ONLINE" ? "text-emerald-500" : "text-red-500"
                          },
                          {
                            label: "Buffered Flash Count:",
                            value: `${offlineOrdersCount} files`,
                            sub: null,
                            color: offlineOrdersCount > 0 ? "text-amber-500" : "text-emerald-500"
                          },
                          {
                            label: "Failed Handshakes:",
                            value: `${deviceStatus?.failedSyncAttempts ?? 0}`,
                            sub: null,
                            color: (deviceStatus?.failedSyncAttempts ?? 0) > 0 ? "text-red-500" : "text-emerald-500"
                          }
                        ].map((stat, i) => (
                          <div key={i} className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold block">{stat.label}</span>
                            <span className={`text-sm font-black font-mono block ${stat.color}`}>{stat.value}</span>
                            {stat.sub && <span className="text-[10px] text-slate-500 font-mono">{stat.sub}</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Network Controls */}
                    <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-bold uppercase tracking-wider font-display">Network Injection Controls</h4>
                        {isNetworkRestoring && (
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 animate-pulse flex items-center gap-1.5">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            ESP32 auto-syncing buffered orders...
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={async () => {
                            setIsOutageSimulating(true);
                            await toggleNetworkState(false);
                            setIsOutageSimulating(false);
                          }}
                          disabled={!isInternetAvailable || isOutageSimulating || isNetworkRestoring}
                          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/25 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-2"
                        >
                          {isOutageSimulating
                            ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            : <WifiOff className="w-3.5 h-3.5" />}
                          {isOutageSimulating ? "Cutting link..." : "Simulate Network Outage"}
                        </button>
                        <button
                          onClick={async () => {
                            setIsNetworkRestoring(true);
                            await toggleNetworkState(true);
                            setIsNetworkRestoring(false);
                          }}
                          disabled={isInternetAvailable || isNetworkRestoring || isOutageSimulating}
                          className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/25 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-2"
                        >
                          {isNetworkRestoring
                            ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            : <Wifi className="w-3.5 h-3.5" />}
                          {isNetworkRestoring ? "Restoring & Syncing..." : "Restore Network Link"}
                        </button>
                        <button
                          onClick={triggerSync}
                          disabled={!isInternetAvailable}
                          className="bg-brand-purple/10 hover:bg-brand-purple text-brand-purple hover:text-white border border-brand-purple/25 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-2"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Force Cloud Sync
                        </button>
                        <button
                          onClick={restartDevice}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restart Edge Device
                        </button>
                      </div>
                    </div>

                    {/* Live Telemetry Events Feed */}
                    <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 font-display flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Telemetry Event Feed
                      </h4>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar font-mono text-xs">
                        {events.length === 0 ? (
                          <p className="text-slate-400 dark:text-slate-500 italic text-center py-8">No telemetry events captured yet.</p>
                        ) : (
                          events.slice(0, 12).map((evt, i) => (
                            <div key={evt.id} className={`flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 ${i === 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-500 dark:text-slate-400"}`}>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-slate-400">[{String(i).padStart(2, "0")}]</span>
                                <span>{evt.event}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 ml-4">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* 6. Profile Tab */}
                {customerTab === "profile" && (
                  <div className="max-w-2xl mx-auto bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 shadow-xl space-y-6">
                    <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center text-3xl font-bold font-display shadow-lg shadow-amber-500/10 animate-in fade-in duration-300">
                        {profileName ? profileName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "CU"}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">Customer Account Settings</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-medium">Manage credentials, endpoints, and local interface configurations.</p>
                      </div>
                    </div>

                    {showProfileSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-[#10B981] p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>Profile configuration saved successfully to device state!</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          title="Full Name"
                          placeholder="e.g. Ramesh Kumar"
                          aria-label="Full Name"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1.5">Shop / Store Name</label>
                        <input
                          type="text"
                          value={profileShopName}
                          onChange={(e) => {
                            setProfileShopName(e.target.value);
                            setOrderForm(prev => ({ ...prev, shopName: e.target.value }));
                          }}
                          title="Shop or Store Name"
                          placeholder="e.g. Balaji Village Cooperatives"
                          aria-label="Shop or Store Name"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          title="Email Address"
                          placeholder="e.g. ramesh@rural.net"
                          aria-label="Email Address"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1.5">Hub Location</label>
                        <input
                          type="text"
                          value={profileLocation}
                          onChange={(e) => setProfileLocation(e.target.value)}
                          title="Hub Location"
                          placeholder="e.g. Ward 3, Village Hub"
                          aria-label="Hub Location"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1.5">Preferred Language</label>
                        <select
                          value={profileLanguage}
                          onChange={(e) => setProfileLanguage(e.target.value)}
                          title="Preferred Language"
                          aria-label="Preferred Language"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-350 focus:outline-none transition-all cursor-pointer font-medium shadow-inner"
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Español</option>
                          <option value="Hindi">हिन्दी</option>
                          <option value="Tamil">தமிழ்</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3 shadow-inner">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Edge API Authentication Key</label>
                          <span className="text-[11px] font-mono text-slate-650 dark:text-slate-400 block mt-1 font-semibold">
                            {copiedApiKey ? "••••••••••••••••••••••••" : "ruralsync_key_live_83b27cf109ea47"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText("ruralsync_key_live_83b27cf109ea47");
                            setCopiedApiKey(true);
                            setTimeout(() => setCopiedApiKey(false), 2000);
                          }}
                          className="bg-white hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-750 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-750 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          {copiedApiKey ? "Copied!" : "Copy Key"}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileSuccess(true);
                          addNotification("Profile configuration saved successfully", "success");
                          setTimeout(() => setShowProfileSuccess(false), 4000);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/15 cursor-pointer"
                      >
                        Save Profile Changes
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            ) : (
              /* URBAN SUPPLIER PORTAL INTERFACE */
              <motion.div
                key="supplier-portal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* 1. Dashboard View */}
                {supplierTab === "dashboard" && (
                  <div className="space-y-8">
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      
                      {/* KPI 1 */}
                      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/50 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover-lift flex flex-col justify-between">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Orders Received</span>
                        <span className="text-2xl font-bold font-display block mt-1 text-slate-900 dark:text-white">{supplierOrdersCount}</span>
                      </div>

                      {/* KPI 2 */}
                      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/50 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover-lift flex flex-col justify-between">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pending Approval</span>
                        <span className={`text-2xl font-bold font-display block mt-1 ${pendingApprovalCount > 0 ? "text-amber-500 animate-pulse" : "text-slate-400"}`}>{pendingApprovalCount}</span>
                      </div>

                      {/* KPI 3 */}
                      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/50 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover-lift flex flex-col justify-between">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Approved Orders</span>
                        <span className="text-2xl font-bold font-display block mt-1 text-blue-500">{approvedOrdersCount}</span>
                      </div>

                      {/* KPI 4 */}
                      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/50 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover-lift flex flex-col justify-between">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Delivered Orders</span>
                        <span className="text-2xl font-bold font-display block mt-1 text-[#10B981]">{deliveredOrdersCount}</span>
                      </div>

                      {/* KPI 5 */}
                      <div className="bg-gradient-to-br from-brand-purple to-brand-blue border-none p-5 rounded-2xl text-white shadow-lg shadow-brand-purple/10 hover-lift flex flex-col justify-between">
                        <span className="text-[10px] text-purple-100 uppercase font-bold tracking-wider">Gross Revenue</span>
                        <span className="text-2xl font-extrabold font-display block mt-1">₹{calculatedRevenue.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Quick Analytics Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Instructions */}
                      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm col-span-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 dark:border-slate-800 font-display">
                          Urban Logistics Management Control
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed mb-5">
                          As an Urban Supplier, you process orders synchronized from rural edge gateways. Switch between tabs to accept proposals, pay simulation balances, and route shipments.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setSupplierTab("incoming")}
                            className="bg-brand-blue hover:opacity-95 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                          >
                            <ListOrdered className="w-4 h-4" />
                            <span>Incoming Orders Queue</span>
                          </button>
                          <button
                            onClick={() => setSupplierTab("dispatch")}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer text-center"
                          >
                            Fulfillment Dispatch
                          </button>
                        </div>
                      </div>

                      {/* Revenue breakdown */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-inner col-span-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-4 font-display">Revenue Breakdown</h4>
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-450">Goods Value (₹/unit × qty)</span>
                            <span className="font-bold font-mono text-slate-850 dark:text-slate-200">₹{calculatedRevenue.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-450">GST / Tax (0%)</span>
                            <span className="font-bold font-mono text-slate-850 dark:text-slate-200">₹0</span>
                          </div>
                          <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
                          <div className="flex justify-between text-sm font-bold">
                            <span>Grand Total</span>
                            <span className="font-mono text-brand-purple dark:text-brand-blue">₹{calculatedRevenue.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Incoming Orders Page */}
                {supplierTab === "incoming" && (
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                        Incoming Cloud Sync Orders
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                        Approve or reject orders synced to the cloud from rural clients.
                      </p>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                            <th className="px-5 py-3 font-bold">Order ID</th>
                            <th className="px-5 py-3 font-bold">Product Name</th>
                            <th className="px-5 py-3 font-bold text-center">Qty</th>
                            <th className="px-5 py-3 font-bold">Customer Store</th>
                            <th className="px-5 py-3 font-bold">Timestamp</th>
                            <th className="px-5 py-3 font-bold text-center">Origin</th>
                            <th className="px-5 py-3 font-bold text-center">Status</th>
                            <th className="px-5 py-3 font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-850">
                          {orders.filter(o =>
                            o.status === "Synced" ||
                            o.status === "Proposed" ||
                            o.status === "Approved" ||
                            o.status === "Payment Pending" ||
                            o.status === "Paid"
                          ).length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center py-20 text-slate-400 dark:text-slate-500">
                                <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-650" />
                                <p className="text-xs italic">No incoming orders awaiting approval</p>
                              </td>
                            </tr>
                          ) : (
                            orders
                              .filter(o =>
                                o.status === "Synced" ||
                                o.status === "Proposed" ||
                                o.status === "Approved" ||
                                o.status === "Payment Pending" ||
                                o.status === "Paid"
                              )
                              .map((order) => {
                                const isOffline = order.storageLocation === "ESP32 Local Buffer";
                                const isPending = order.status === "Synced" || order.status === "Proposed";
                                const isApproved = order.status === "Approved";
                                const isPaymentPending = order.status === "Payment Pending";
                                const isPaid = order.status === "Paid";
                                return (
                                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                    <td className="px-5 py-4 font-mono font-bold text-slate-850 dark:text-slate-200">
                                      {order.orderId}
                                    </td>
                                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-100">
                                      {order.productName}
                                    </td>
                                    <td className="px-5 py-4 text-center font-mono font-semibold">
                                      {order.quantity}
                                    </td>
                                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                                      {order.retailerName}
                                    </td>
                                    <td className="px-5 py-4 font-mono text-[10px] text-slate-450">
                                      {new Date(order.timestamp).toLocaleTimeString()}
                                    </td>
                                    {/* Origin badge */}
                                    <td className="px-5 py-4 text-center">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        isOffline
                                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                      }`}>
                                        {isOffline ? "📡 Offline" : "☁ Online"}
                                      </span>
                                    </td>
                                    {/* Status badge */}
                                    <td className="px-5 py-4 text-center">
                                      {isPaid ? (
                                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-black">
                                          <CheckCircle className="w-3 h-3" /> Paid
                                        </span>
                                      ) : isPaymentPending ? (
                                        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-black animate-pulse">
                                          <CreditCard className="w-3 h-3" /> Pending Payment
                                        </span>
                                      ) : isApproved ? (
                                        <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full text-[10px] font-black">
                                          <CheckCircle className="w-3 h-3" /> Approved
                                        </span>
                                      ) : (
                                        renderStatusBadge(order.status)
                                      )}
                                    </td>
                                    {/* Actions */}
                                    <td className="px-5 py-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        {isPending && (
                                          <>
                                            <button
                                              onClick={() => rejectOrder(order.id)}
                                              className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/25 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                            >
                                              Reject
                                            </button>
                                            <button
                                              onClick={() => handleApproveOrder(order.id)}
                                              disabled={isActionLoading === order.id}
                                              className="bg-brand-blue hover:opacity-95 text-white px-3.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                            >
                                              {isActionLoading === order.id ? "Accepting..." : "Accept Order"}
                                            </button>
                                          </>
                                        )}
                                        {isApproved && (
                                          <button
                                            onClick={() => setPaymentRequestOrder(order)}
                                            className="bg-brand-purple hover:opacity-95 text-white px-3.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                                          >
                                            <DollarSign className="w-3 h-3" />
                                            Request Payment
                                          </button>
                                        )}
                                        {(isPaymentPending || isPaid) && (
                                          <span className="text-[10px] text-slate-400 italic">
                                            {isPaid ? "Payment received" : "Awaiting customer payment"}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Payment Request Modal */}
                <AnimatePresence>
                  {paymentRequestOrder && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                      onClick={(e) => { if (e.target === e.currentTarget) setPaymentRequestOrder(null); }}
                    >
                      <motion.div
                        initial={{ scale: 0.92, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 w-full max-w-md overflow-hidden"
                      >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-br from-brand-purple to-brand-blue p-6 relative">
                          <button
                            onClick={() => setPaymentRequestOrder(null)}
                            title="Close"
                            aria-label="Close"
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h2 className="text-lg font-black font-display text-white">Request Payment</h2>
                              <p className="text-xs text-purple-200 mt-0.5">Offline order accepted — initiate payment from customer</p>
                            </div>
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="p-6 space-y-4">
                          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800 space-y-3">
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Order Summary</span>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Order ID</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">{paymentRequestOrder.orderId}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Product</span>
                                <span className="font-bold text-slate-900 dark:text-white text-right max-w-[200px]">{paymentRequestOrder.productName}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Quantity</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">{paymentRequestOrder.quantity} units</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Customer Store</span>
                                <span className="font-bold text-slate-900 dark:text-white">{paymentRequestOrder.retailerName}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Priority</span>
                                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                  paymentRequestOrder.priority === "High" ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400" :
                                  paymentRequestOrder.priority === "Medium" ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                  "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                }`}>{paymentRequestOrder.priority}</span>
                              </div>
                              <div className="flex justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                                <span className="text-slate-500">Origin</span>
                                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                  📡 Offline Buffered
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-xl p-3 text-[11px] text-brand-purple dark:text-purple-300 font-medium leading-relaxed">
                            This order was placed offline via ESP32. Accepting it will notify the customer to proceed with payment.
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => setPaymentRequestOrder(null)}
                              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer"
                            >
                              Close
                            </button>
                            <button
                              onClick={async () => {
                                if (!paymentRequestOrder) return;
                                await requestPayment(paymentRequestOrder.id);
                                addNotification(`Payment request sent to ${paymentRequestOrder.retailerName}`, "success");
                                setPaymentRequestOrder(null);
                              }}
                              className="flex-1 bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-95 text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-brand-purple/25 flex items-center justify-center gap-2"
                            >
                              <DollarSign className="w-4 h-4" />
                              Proceed to Request Payment
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 3. Dispatch Management Page */}
                {supplierTab === "dispatch" && (
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                        Logistics & Order Fulfillment
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                        Dispatch paid goods to village centers and mark shipments as delivered.
                      </p>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                            <th className="px-5 py-3 font-bold">Order ID</th>
                            <th className="px-5 py-3 font-bold">Product Details</th>
                            <th className="px-5 py-3 font-bold">Retailer Destination</th>
                            <th className="px-5 py-3 font-bold">Additional Notes</th>
                            <th className="px-5 py-3 font-bold text-center">Status</th>
                            <th className="px-5 py-3 font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-850">
                          {orders.filter(o => o.status === "Paid" || o.status === "In Transit" || o.status === "Delivered").length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-20 text-slate-400 dark:text-slate-500">
                                <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-650" />
                                <p className="text-xs italic">No orders in logistics pipeline</p>
                              </td>
                            </tr>
                          ) : (
                            orders
                              .filter(o => o.status === "Paid" || o.status === "In Transit" || o.status === "Delivered")
                              .map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                  <td className="px-5 py-4 font-mono font-bold text-slate-850 dark:text-slate-200">
                                    {order.orderId}
                                  </td>
                                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-100">
                                    {order.productName} (Qty: {order.quantity})
                                  </td>
                                  <td className="px-5 py-4 text-slate-550 dark:text-slate-400">
                                    {order.retailerName}
                                  </td>
                                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-medium italic">
                                    {order.notes || "None"}
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    {renderStatusBadge(order.status)}
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    {order.status === "Paid" && (
                                      <button
                                        onClick={() => handleDispatchOrder(order.id)}
                                        disabled={isActionLoading === order.id}
                                        className="bg-brand-blue hover:opacity-95 text-white px-3.5 py-1.8 rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                                      >
                                        <Truck className="w-3.5 h-3.5" />
                                        <span>{isActionLoading === order.id ? "Shipping..." : "Dispatch Order"}</span>
                                      </button>
                                    )}
                                    {order.status === "In Transit" && (
                                      <button
                                        onClick={() => handleDeliverOrder(order.id)}
                                        disabled={isActionLoading === order.id}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.8 rounded-lg text-[10px] font-bold shadow transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>{isActionLoading === order.id ? "Delivering..." : "Mark Delivered"}</span>
                                      </button>
                                    )}
                                    {order.status === "Delivered" && (
                                      <span className="text-[10px] text-[#10B981] font-bold uppercase font-mono mr-2">Completed ✓</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. Analytics Tab */}
                {supplierTab === "analytics" && (
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm space-y-8">
                    <div>
                      <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                        Supplier SaaS Analytics
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                        High-precision visual charts displaying transaction volumes and fulfillment metrics.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Chart 1: Order Intake Trends */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-inner">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block font-display">
                              Orders Received vs Synced Trends
                            </span>
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono font-medium">Daily volume metrics</span>
                          </div>
                          <span className="text-[#10B981] text-xs font-bold font-mono">+12.5%</span>
                        </div>

                        {/* SVG Area Chart */}
                        <div className="h-48 w-full relative pt-2">
                          <svg className="w-full h-36" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25"/>
                                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0"/>
                              </linearGradient>
                            </defs>
                            {/* Gridlines */}
                            <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="0.5" />
                            <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="0.5" />
                            {/* Chart Area */}
                            <path
                              d="M 0 25 Q 15 15, 30 18 T 60 8 T 90 2 L 100 2 L 100 30 L 0 30 Z"
                              fill="url(#blueGradient)"
                            />
                            {/* Chart Line */}
                            <path
                              d="M 0 25 Q 15 15, 30 18 T 60 8 T 90 2 L 100 2"
                              fill="none"
                              stroke="#3B82F6"
                              strokeWidth="1.5"
                            />
                            {/* Data points */}
                            <circle cx="30" cy="18" r="1.5" fill="#5B7CFA" />
                            <circle cx="60" cy="8" r="1.5" fill="#3B82F6" />
                            <circle cx="90" cy="2" r="1.5" fill="#3b82f6" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col justify-between text-[9px] text-slate-450 dark:text-slate-500 font-mono pointer-events-none">
                            <span>120 Items</span>
                            <span>60 Items</span>
                            <span>0 Items</span>
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
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono font-medium">Data loss prevention audits</span>
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
                            { label: "Current", val: pendingOrders, color: "from-amber-400 to-[#F59E0B]" }
                          ].map((bar, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                              <div className="text-[10px] font-mono font-bold text-slate-650 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                {bar.val}
                              </div>
                              <div className="w-8 bg-slate-250 dark:bg-slate-850 rounded-t-lg overflow-hidden h-28 flex items-end">
                                <div
                                  ref={(el) => { if (el) el.style.height = `${(bar.val / 12) * 100}%`; }}
                                  className={`w-full bg-gradient-to-t ${bar.color} rounded-t-lg transition-all duration-500`}
                                />
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono truncate max-w-[64px]">{bar.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 5. Profile Tab */}
                {supplierTab === "profile" && (
                  <div className="max-w-2xl mx-auto bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 shadow-xl space-y-6">
                    <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-purple text-white flex items-center justify-center text-3xl font-bold font-display shadow-lg shadow-brand-blue/10 animate-in fade-in duration-300">
                        {profileName ? profileName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "SU"}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">Supplier Admin Settings</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-455 mt-1 font-medium">Manage Logistics hub mappings, email queues, and secure endpoints.</p>
                      </div>
                    </div>

                    {showProfileSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-[#10B981] p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>Profile configuration saved successfully to device state!</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          title="Full Name"
                          placeholder="e.g. Supplier Admin"
                          aria-label="Full Name"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-blue rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          title="Email Address"
                          placeholder="e.g. supplier@ruralsync.net"
                          aria-label="Email Address"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-blue rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1.5">Hub Location</label>
                        <input
                          type="text"
                          value={profileLocation}
                          onChange={(e) => setProfileLocation(e.target.value)}
                          title="Hub Location"
                          placeholder="e.g. Central Warehouse Hub A"
                          aria-label="Hub Location"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-blue rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1.5">Preferred Language</label>
                        <select
                          value={profileLanguage}
                          onChange={(e) => setProfileLanguage(e.target.value)}
                          title="Preferred Language"
                          aria-label="Preferred Language"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-blue rounded-xl px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-350 focus:outline-none transition-all cursor-pointer font-medium shadow-inner"
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Español</option>
                          <option value="Hindi">हिन्दी</option>
                          <option value="Tamil">தமிழ்</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-3 shadow-inner">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Edge API Authentication Key</label>
                          <span className="text-[11px] font-mono text-slate-650 dark:text-slate-400 block mt-1 font-semibold">
                            {copiedApiKey ? "••••••••••••••••••••••••" : "ruralsync_key_live_58c27cf109ea91"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText("ruralsync_key_live_58c27cf109ea91");
                            setCopiedApiKey(true);
                            setTimeout(() => setCopiedApiKey(false), 2000);
                          }}
                          className="bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-750 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-755 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          {copiedApiKey ? "Copied!" : "Copy Key"}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileSuccess(true);
                          addNotification("Profile configuration saved successfully", "success");
                          setTimeout(() => setShowProfileSuccess(false), 4000);
                        }}
                        className="bg-brand-blue hover:opacity-95 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-brand-blue/15 cursor-pointer"
                      >
                        Save Profile Changes
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>
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
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-md p-4 font-sans"
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
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => rejectOrder(proposed.id)}
                      className="bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center"
                    >
                      Decline Order
                    </button>
                    <button
                      onClick={() => handleApproveOrder(proposed.id)}
                      disabled={isActionLoading === proposed.id}
                      className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-95 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center shadow-lg shadow-brand-purple/20 disabled:opacity-50"
                    >
                      {isActionLoading === proposed.id ? "Accepting..." : "Accept Order"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()
        )}
      </AnimatePresence>

      {/* ===== Customer Payment Modal ===== */}
      <AnimatePresence>
        {customerPaymentOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget && !paymentProcessing) setCustomerPaymentOrder(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 relative">
                <button
                  onClick={() => { if (!paymentProcessing) setCustomerPaymentOrder(null); }}
                  title="Close"
                  aria-label="Close"
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black font-display text-white">Complete Payment</h2>
                    <p className="text-xs text-orange-100 mt-0.5">Payment requested by your supplier</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Order Summary */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-3">Order Summary</span>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Order ID</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{customerPaymentOrder.orderId}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Product</span>
                      <span className="font-bold text-slate-900 dark:text-white text-right max-w-[200px]">{customerPaymentOrder.productName}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Quantity</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{customerPaymentOrder.quantity} units</span>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 font-bold">Total Amount</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">₹{((customerPaymentOrder.pricePerUnit ?? 1500) * customerPaymentOrder.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-3">Select Payment Method</span>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: "upi", label: "UPI", icon: "📱", desc: "Instant" },
                      { id: "card", label: "Card", icon: "💳", desc: "Debit/Credit" },
                      { id: "cash", label: "Cash", icon: "💵", desc: "On Delivery" }
                    ] as const).map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                          paymentMethod === method.id
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                            : "border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700"
                        }`}
                      >
                        <span className="text-xl block mb-1">{method.icon}</span>
                        <span className={`text-[11px] font-black block ${paymentMethod === method.id ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"}`}>{method.label}</span>
                        <span className="text-[9px] text-slate-400 block">{method.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* UPI ID field */}
                {paymentMethod === "upi" && (
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">UPI ID / Phone Number</label>
                    <input
                      type="text"
                      placeholder="yourname@upi or 9876543210"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                    />
                  </div>
                )}

                {/* Card fields */}
                {paymentMethod === "card" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">Card Number</label>
                      <input
                        type="text"
                        placeholder="•••• •••• •••• ••••"
                        maxLength={19}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM / YY"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={3}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Cash note */}
                {paymentMethod === "cash" && (
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[11px] text-slate-500 dark:text-slate-400">
                    Cash payment will be collected at the time of delivery. Your order will be marked as paid on receipt.
                  </div>
                )}

                {/* Pay Button */}
                <button
                  onClick={async () => {
                    if (!customerPaymentOrder || paymentProcessing) return;
                    setPaymentProcessing(true);
                    await new Promise(r => setTimeout(r, 1500));
                    await handlePayOrder(customerPaymentOrder.id);
                    setPaymentProcessing(false);
                    const total = ((customerPaymentOrder.pricePerUnit ?? 1500) * customerPaymentOrder.quantity).toLocaleString("en-IN");
                    addNotification(`Payment of ₹${total} confirmed via ${paymentMethod.toUpperCase()}!`, "success");
                    setCustomerPaymentOrder(null);
                    setCustomerTab("tracking");
                  }}
                  disabled={paymentProcessing}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 disabled:opacity-70 text-white font-black py-3.5 rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
                >
                  {paymentProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      Pay ₹{((customerPaymentOrder.pricePerUnit ?? 1500) * customerPaymentOrder.quantity).toLocaleString("en-IN")} Now
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
