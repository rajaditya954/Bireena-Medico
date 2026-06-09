import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  X, 
  Calendar, 
  Activity, 
  Pill, 
  MessageSquare,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { cn } from "../../lib/utils";

import { Role } from "../../types";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "New Appointment Request",
    description: "John Doe requested a consultation for tomorrow at 10:00 AM.",
    time: "5m ago",
    type: "appointment",
    icon: Calendar,
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    id: 2,
    title: "Lab Results Ready",
    description: "The hematology reports for Sarah Smith have been uploaded.",
    time: "1h ago",
    type: "lab",
    icon: Activity,
    color: "text-purple-500",
    bg: "bg-purple-50"
  },
  {
    id: 3,
    title: "Inventory Alert",
    description: "Amoxicillin stock is running low in the central pharmacy.",
    time: "3h ago",
    type: "pharmacy",
    icon: Pill,
    color: "text-orange-500",
    bg: "bg-orange-50"
  },
  {
    id: 4,
    title: "System Update",
    description: "Medico v2.4 includes optimized patient history timelines.",
    time: "5h ago",
    type: "system",
    icon: AlertCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-50"
  }
];

const getNotificationsForRole = (role) => {
  const common = [
    {
      id: 4,
      title: "System Update",
      description: "Medico v2.4 includes optimized patient history timelines.",
      time: "5h ago",
      type: "system",
      icon: AlertCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    }
  ];

  const roleSpecific = {
    [Role.DOCTOR]: [
      {
        id: 1,
        title: "New Appointment Request",
        description: "John Doe requested a consultation for tomorrow at 10:00 AM.",
        time: "5m ago",
        type: "appointment",
        icon: Calendar,
        color: "text-blue-500",
        bg: "bg-blue-50"
      },
      {
        id: 2,
        title: "Lab Results Ready",
        description: "The hematology reports for Sarah Smith have been uploaded.",
        time: "1h ago",
        type: "lab",
        icon: Activity,
        color: "text-purple-500",
        bg: "bg-purple-50"
      }
    ],
    [Role.PHARMACY]: [
      {
        id: 3,
        title: "Inventory Alert",
        description: "Amoxicillin stock is running low in the central pharmacy.",
        time: "3h ago",
        type: "pharmacy",
        icon: Pill,
        color: "text-orange-500",
        bg: "bg-orange-50"
      }
    ],
    [Role.ADMIN]: [
      {
        id: 3,
        title: "Inventory Alert",
        description: "Critical amoxicillin stock depletion detected.",
        time: "3h ago",
        type: "system",
        icon: Pill,
        color: "text-orange-500",
        bg: "bg-orange-50"
      },
      {
        id: 5,
        title: "Security Audit",
        description: "A full system security scan was completed successfully.",
        time: "24h ago",
        type: "system",
        icon: CheckCircle2,
        color: "text-emerald-500",
        bg: "bg-emerald-50"
      }
    ]
  };

  return [...(roleSpecific[role] || []), ...common];
};

export default function NotificationCenter({ isOpen, onClose, role }) {
  const notifications = getNotificationsForRole(role);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-40 bg-black/5 lg:hidden" 
            onClick={onClose} 
          />
          
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-16 w-full sm:w-[400px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50 flex flex-col max-h-[85vh]"
          >
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-primary-dark tracking-tighter italic">Notifications</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Activity Stream</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className="p-4 rounded-[1.5rem] hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group cursor-pointer"
                >
                  <div className="flex gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                      notif.bg,
                      notif.color
                    )}>
                      <notif.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-black text-primary-dark tracking-tight">{notif.title}</h4>
                        <span className="text-[9px] font-bold text-gray-400">{notif.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed italic">
                        {notif.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-50 bg-gray-50/50">
              <button className="w-full py-4 bg-white text-primary-dark text-xs font-black uppercase tracking-widest rounded-2xl border border-gray-100 shadow-sm hover:bg-emerald-600 hover:text-white transition-all active:scale-95">
                Mark All as Read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
