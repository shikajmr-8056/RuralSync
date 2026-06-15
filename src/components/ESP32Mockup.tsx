import React, { useState, useEffect } from "react";
import { Cpu, Wifi, HardDrive, RotateCcw, AlertTriangle, Eye, Settings, FileText, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DeviceStatus, DeviceEvent, Order } from "../types";

interface ESP32MockupProps {
  status: DeviceStatus;
  events: DeviceEvent[];
  orders: Order[];
  isInternetAvailable: boolean;
  onRestart: () => void;
  onHardwareButtonOrder: () => void;
}

export default function ESP32Mockup({
  status,
  events,
  orders,
  isInternetAvailable,
  onRestart,
  onHardwareButtonOrder
}: ESP32MockupProps) {
  const [activeLed, setActiveLed] = useState<"wifi" | "storage" | "sync" | null>(null);
  const [showLittleFS, setShowLittleFS] = useState(false);

  // Filter pending orders representing buffered files on LittleFS /orders.txt
  const bufferedOrders = orders.filter((o) => o.status === "Pending");

  // Animate LED blink when actions happen
  useEffect(() => {
    if (status.status === "SYNCING") {
      setActiveLed("sync");
    } else if (bufferedOrders.length > 0 && Math.random() > 0.5) {
      setActiveLed("storage");
      const t = setTimeout(() => setActiveLed(null), 300);
      return () => clearTimeout(t);
    } else {
      setActiveLed("wifi");
      const t = setTimeout(() => setActiveLed(null), 400);
      return () => clearTimeout(t);
    }
  }, [orders, status.status]);

  return (
    <div className="bg-[#1E293B] text-slate-100 rounded-3xl p-6 shadow-xl border border-slate-700/50 dark:border-slate-800 relative overflow-hidden backdrop-blur-xl">
      {/* Glossy Overlay Reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-inner">
            <Cpu className="w-5 h-5 text-slate-900 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-amber-400 text-sm tracking-wide">
              ESP32 EDGE GATEWAY
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              IP: 192.168.4.1 | COM 4
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium flex items-center gap-1 ${
              isInternetAvailable
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            <Wifi className="w-3 h-3 animate-pulse" />
            {isInternetAvailable ? "WIFI_UP" : "WIFI_DOWN"}
          </span>
        </div>
      </div>

      {/* Main Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
        
        {/* Left Side: Glowing LCD Screen */}
        <div className="bg-[#090D16] rounded-xl p-4 border border-cyan-500/20 flex flex-col justify-between min-h-[220px] shadow-[inset_0_0_12px_rgba(6,182,212,0.15)] font-mono relative">
          <div className="absolute top-2 right-2 flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.8)]" title="POWER LED" />
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                activeLed === "wifi" && isInternetAvailable
                  ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  : activeLed === "storage"
                  ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                  : activeLed === "sync"
                  ? "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]"
                  : "bg-slate-800"
              }`}
              title="STATE_LED"
            />
          </div>

          <div>
            <div className="text-[11px] text-cyan-400 pb-1 border-b border-cyan-500/10 flex justify-between">
              <span>OLED SSD1306 v1.0</span>
              <span className="text-[9px] text-cyan-500/70 animate-pulse">● LIVE</span>
            </div>
            
            {/* Display screen body */}
            <div className="mt-3 space-y-1.5 text-xs text-cyan-300/95">
              <div className="flex justify-between">
                <span>SSID:</span>
                <span className="text-white font-medium">RuralNet_AM2</span>
              </div>
              <div className="flex justify-between">
                <span>RSSI:</span>
                <span className="text-white">{isInternetAvailable ? "-64 dBm" : "DISCONN"}</span>
              </div>
              <div className="flex justify-between">
                <span>Partition:</span>
                <span className="text-white">LittleFS Active</span>
              </div>
              <div className="flex justify-between items-center bg-cyan-950/20 p-2 rounded border border-cyan-500/10 text-[11px] mt-2">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  Local Buffer:
                </span>
                <span className={`px-2 py-0.5 rounded font-bold ${bufferedOrders.length > 0 ? "bg-amber-400 text-slate-950 animate-bounce" : "bg-slate-800 text-slate-400"}`}>
                  {bufferedOrders.length} orders
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-900 text-[10px] text-slate-500 flex justify-between items-center leading-none">
            <span className="truncate max-w-[120px]">
              {events[0] ? events[0].event : "WiFi searching..."}
            </span>
            <span className="text-[#10B981] text-[9px] bg-[#10B981]/10 px-2 py-0.5 rounded font-bold shrink-0">
              {status.status}
            </span>
          </div>
        </div>

        {/* Right Side: Microcontroller hardware components & buttons */}
        <div className="flex flex-col justify-between gap-4">
          <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-700/60 text-xs space-y-2.5">
            <div className="flex justify-between text-slate-400">
              <span>Processor:</span>
              <span className="text-slate-200">ESP32-WROOM-32E</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>SRAM/Flash:</span>
              <span className="text-slate-200">520KB / 4MB</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>File Storage:</span>
              <span className="text-amber-400 font-medium">LittleFS (Wear-Level)</span>
            </div>

            {/* LittleFS Explorer Button */}
            <button
              onClick={() => setShowLittleFS(!showLittleFS)}
              className="mt-1 w-full bg-slate-800 hover:bg-slate-700/80 text-slate-300 py-1.8 px-2 rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-1.5 text-[11px] hover:text-white cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>{showLittleFS ? "Close" : "Explore"} Storage (/orders.txt)</span>
            </button>
          </div>

          {/* Golden tactile buttons mock */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onHardwareButtonOrder}
              className="group bg-slate-800 hover:bg-slate-750 active:bg-slate-850 text-slate-200 p-3 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-all flex flex-col items-center justify-center gap-2 text-center shadow-lg relative cursor-pointer"
            >
              {/* Golden Outer Ring */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-b from-yellow-300 via-amber-500 to-amber-700 p-0.5 shadow-md flex items-center justify-center group-active:scale-95 transition-transform">
                <div className="w-full h-full rounded-full bg-[#1E293B] border border-slate-700 shadow-inner flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-300 group-hover:text-amber-400">GPIO 12</span>
              <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wide">Create Order</span>
            </button>

            <button
              onClick={onRestart}
              className="group bg-slate-800 hover:bg-slate-750 active:bg-slate-850 text-slate-200 p-3 rounded-xl border border-slate-700 hover:border-red-500/50 transition-all flex flex-col items-center justify-center gap-2 text-center shadow-lg relative cursor-pointer"
            >
              {/* Red EN Button */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-b from-red-400 via-red-600 to-red-800 p-0.5 shadow-md flex items-center justify-center group-active:scale-95 transition-transform">
                <div className="w-full h-full rounded-full bg-[#1E293B] border border-slate-700 shadow-inner flex items-center justify-center">
                  <RotateCcw className="w-3 h-3 text-[#EF4444]" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-300 group-hover:text-red-400">EN Button</span>
              <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wide">Restart SoC</span>
            </button>
          </div>
        </div>
      </div>

      {/* LittleFS File Preview Drawer */}
      <AnimatePresence>
        {showLittleFS && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 border-t border-slate-800 pt-4 overflow-hidden relative z-10"
          >
            <div className="bg-[#090D16] rounded-xl p-3 border border-slate-850 font-mono text-[11px] text-slate-300 max-h-[160px] overflow-y-auto custom-scrollbar shadow-inner">
              <div className="flex items-center justify-between text-amber-500 border-b border-slate-850 pb-1.5 mb-2">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>File: /littlefs/orders.txt</span>
                </span>
                <span>{bufferedOrders.length * 96} Bytes</span>
              </div>
              {bufferedOrders.length === 0 ? (
                <p className="text-slate-500 italic text-center py-4 text-xs font-sans">
                  No records stored on current Flash Partition. orders.txt does not exist or has been truncated.
                </p>
              ) : (
                <div className="space-y-1">
                  {bufferedOrders.map((ord, idx) => (
                    <div key={ord.id} className="text-amber-400/90 hover:bg-slate-900/50 p-1.5 rounded transition-colors whitespace-nowrap border-b border-slate-900/40">
                      [{idx + 1}] ID:{ord.orderId} | RET:{ord.retailerName.substring(0, 8)}... | PROD:{ord.productName.substring(0, 10)} | QTY:{ord.quantity} | PR:{ord.priority}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection warning in offline state */}
      {!isInternetAvailable && (
        <div className="absolute inset-x-0 bottom-0 bg-[#EF4444]/10 text-[#EF4444] px-4 py-1.5 text-[10px] font-mono border-t border-[#EF4444]/20 flex items-center justify-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-bounce" />
          <span>OUTAGE ACTIVE: Buffering uploads in LittleFS local sector</span>
        </div>
      )}
    </div>
  );
}
