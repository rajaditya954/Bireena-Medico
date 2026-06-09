import { motion } from "motion/react";

import {
    HeartPulse,
    Activity,
    Plus,
    CircleDot,

    // MEDICAL TOOLS
    Stethoscope,
    Syringe,
    Pill,
    Microscope,
    ClipboardPlus,
    ScanHeart,
    Cross,
    Thermometer,
    ShieldPlus,
    FlaskConical,
    Ambulance,
    Hospital,
    Heart,
    BadgePlus,
} from "lucide-react";

export default function AnimatedBackground() {

    // ======================================================
    // PARTICLES
    // ======================================================

    const particles = Array.from({ length: 120 });

    // ======================================================
    // ECG LINES
    // ======================================================

    const pulseLines = Array.from({ length: 7 });

    // ======================================================
    // FLOATING MEDICAL TOOLS
    // ======================================================

    const floatingIcons = [

        // =====================================================
        // MAIN LARGE TOOLS
        // =====================================================

        {
            icon: Stethoscope,
            top: "12%",
            left: "8%",
            size: "w-24 h-24",
            color: "text-emerald-500",
            duration: 8,
        },

        {
            icon: Microscope,
            top: "18%",
            right: "10%",
            size: "w-20 h-20",
            color: "text-cyan-500",
            duration: 10,
        },

        {
            icon: Syringe,
            bottom: "18%",
            left: "14%",
            size: "w-16 h-16",
            color: "text-emerald-600",
            duration: 9,
        },

        {
            icon: Pill,
            top: "45%",
            right: "6%",
            size: "w-20 h-20",
            color: "text-pink-500",
            duration: 11,
        },

        {
            icon: ClipboardPlus,
            top: "62%",
            left: "7%",
            size: "w-18 h-18",
            color: "text-blue-500",
            duration: 13,
        },

        {
            icon: ScanHeart,
            top: "30%",
            left: "42%",
            size: "w-20 h-20",
            color: "text-red-500",
            duration: 12,
        },

        {
            icon: Thermometer,
            bottom: "12%",
            right: "20%",
            size: "w-16 h-16",
            color: "text-orange-500",
            duration: 8,
        },

        {
            icon: FlaskConical,
            top: "8%",
            left: "55%",
            size: "w-16 h-16",
            color: "text-violet-500",
            duration: 9,
        },

        {
            icon: ShieldPlus,
            bottom: "24%",
            right: "35%",
            size: "w-20 h-20",
            color: "text-teal-500",
            duration: 14,
        },

        // =====================================================
        // MID DENSITY
        // =====================================================

        {
            icon: Activity,
            top: "14%",
            left: "30%",
            size: "w-14 h-14",
            color: "text-emerald-400",
            duration: 9,
        },

        {
            icon: HeartPulse,
            top: "72%",
            left: "32%",
            size: "w-14 h-14",
            color: "text-red-400",
            duration: 10,
        },

        {
            icon: Cross,
            top: "22%",
            right: "28%",
            size: "w-12 h-12",
            color: "text-cyan-400",
            duration: 8,
        },

        {
            icon: Pill,
            bottom: "30%",
            left: "45%",
            size: "w-12 h-12",
            color: "text-pink-400",
            duration: 12,
        },

        {
            icon: FlaskConical,
            top: "48%",
            left: "18%",
            size: "w-12 h-12",
            color: "text-violet-400",
            duration: 7,
        },

        {
            icon: ClipboardPlus,
            top: "55%",
            right: "16%",
            size: "w-14 h-14",
            color: "text-blue-400",
            duration: 13,
        },

        {
            icon: Stethoscope,
            bottom: "8%",
            right: "8%",
            size: "w-16 h-16",
            color: "text-emerald-500",
            duration: 10,
        },

        {
            icon: Syringe,
            top: "6%",
            right: "42%",
            size: "w-12 h-12",
            color: "text-yellow-500",
            duration: 11,
        },

        // =====================================================
        // EXTRA FLOATING TOOLS
        // =====================================================

        {
            icon: HeartPulse,
            top: "20%",
            left: "65%",
            size: "w-10 h-10",
            color: "text-rose-500",
            duration: 9,
        },

        {
            icon: Pill,
            top: "80%",
            right: "12%",
            size: "w-10 h-10",
            color: "text-fuchsia-400",
            duration: 7,
        },

        {
            icon: Stethoscope,
            top: "38%",
            left: "4%",
            size: "w-10 h-10",
            color: "text-emerald-400",
            duration: 8,
        },

        {
            icon: Microscope,
            top: "65%",
            right: "4%",
            size: "w-10 h-10",
            color: "text-sky-500",
            duration: 12,
        },

        {
            icon: ShieldPlus,
            top: "12%",
            right: "55%",
            size: "w-12 h-12",
            color: "text-teal-400",
            duration: 13,
        },

        {
            icon: Thermometer,
            top: "42%",
            right: "42%",
            size: "w-10 h-10",
            color: "text-orange-400",
            duration: 10,
        },

        {
            icon: Activity,
            bottom: "14%",
            left: "60%",
            size: "w-10 h-10",
            color: "text-green-400",
            duration: 9,
        },

        {
            icon: ClipboardPlus,
            top: "28%",
            left: "22%",
            size: "w-10 h-10",
            color: "text-blue-300",
            duration: 11,
        },

        {
            icon: Syringe,
            top: "74%",
            left: "72%",
            size: "w-10 h-10",
            color: "text-yellow-400",
            duration: 8,
        },

        {
            icon: FlaskConical,
            bottom: "10%",
            left: "26%",
            size: "w-10 h-10",
            color: "text-purple-400",
            duration: 10,
        },

        {
            icon: Cross,
            top: "52%",
            left: "52%",
            size: "w-8 h-8",
            color: "text-cyan-300",
            duration: 6,
        },{
            icon: Stethoscope,
            top: "12%",
            left: "8%",
            size: "w-24 h-24",
            color: "text-emerald-500",
            duration: 8,
        },

        {
            icon: Microscope,
            top: "18%",
            right: "10%",
            size: "w-20 h-20",
            color: "text-cyan-500",
            duration: 10,
        },

        {
            icon: Syringe,
            bottom: "18%",
            left: "14%",
            size: "w-16 h-16",
            color: "text-emerald-600",
            duration: 9,
        },

        {
            icon: Pill,
            top: "45%",
            right: "6%",
            size: "w-20 h-20",
            color: "text-pink-500",
            duration: 11,
        },

        {
            icon: ClipboardPlus,
            top: "62%",
            left: "7%",
            size: "w-18 h-18",
            color: "text-blue-500",
            duration: 13,
        },

        {
            icon: ScanHeart,
            top: "30%",
            left: "42%",
            size: "w-20 h-20",
            color: "text-red-500",
            duration: 12,
        },

        {
            icon: Thermometer,
            bottom: "12%",
            right: "20%",
            size: "w-16 h-16",
            color: "text-orange-500",
            duration: 8,
        },

        {
            icon: FlaskConical,
            top: "8%",
            left: "55%",
            size: "w-16 h-16",
            color: "text-violet-500",
            duration: 9,
        },

        {
            icon: ShieldPlus,
            bottom: "24%",
            right: "35%",
            size: "w-20 h-20",
            color: "text-teal-500",
            duration: 14,
        },

        // =====================================================
        // MID DENSITY
        // =====================================================

        {
            icon: Activity,
            top: "14%",
            left: "30%",
            size: "w-14 h-14",
            color: "text-emerald-400",
            duration: 9,
        },

        {
            icon: HeartPulse,
            top: "72%",
            left: "32%",
            size: "w-14 h-14",
            color: "text-red-400",
            duration: 10,
        },

        {
            icon: Cross,
            top: "22%",
            right: "28%",
            size: "w-12 h-12",
            color: "text-cyan-400",
            duration: 8,
        },

        {
            icon: Pill,
            bottom: "30%",
            left: "45%",
            size: "w-12 h-12",
            color: "text-pink-400",
            duration: 12,
        },

        {
            icon: FlaskConical,
            top: "48%",
            left: "18%",
            size: "w-12 h-12",
            color: "text-violet-400",
            duration: 7,
        },

        {
            icon: ClipboardPlus,
            top: "55%",
            right: "16%",
            size: "w-14 h-14",
            color: "text-blue-400",
            duration: 13,
        },

        {
            icon: Stethoscope,
            bottom: "8%",
            right: "8%",
            size: "w-16 h-16",
            color: "text-emerald-500",
            duration: 10,
        },

        {
            icon: Syringe,
            top: "6%",
            right: "42%",
            size: "w-12 h-12",
            color: "text-yellow-500",
            duration: 11,
        },

        // =====================================================
        // EXTRA FLOATING TOOLS
        // =====================================================

        {
            icon: HeartPulse,
            top: "20%",
            left: "65%",
            size: "w-10 h-10",
            color: "text-rose-500",
            duration: 9,
        },

        {
            icon: Pill,
            top: "80%",
            right: "12%",
            size: "w-10 h-10",
            color: "text-fuchsia-400",
            duration: 7,
        },

        {
            icon: Stethoscope,
            top: "38%",
            left: "4%",
            size: "w-10 h-10",
            color: "text-emerald-400",
            duration: 8,
        },{
            icon: Stethoscope,
            top: "12%",
            left: "8%",
            size: "w-24 h-24",
            color: "text-emerald-500",
            duration: 8,
        },

        {
            icon: Microscope,
            top: "18%",
            right: "10%",
            size: "w-20 h-20",
            color: "text-cyan-500",
            duration: 10,
        },

        {
            icon: Syringe,
            bottom: "18%",
            left: "14%",
            size: "w-16 h-16",
            color: "text-emerald-600",
            duration: 9,
        },

        {
            icon: Pill,
            top: "45%",
            right: "6%",
            size: "w-20 h-20",
            color: "text-pink-500",
            duration: 11,
        },

        {
            icon: ClipboardPlus,
            top: "62%",
            left: "7%",
            size: "w-18 h-18",
            color: "text-blue-500",
            duration: 13,
        },

        {
            icon: ScanHeart,
            top: "30%",
            left: "42%",
            size: "w-20 h-20",
            color: "text-red-500",
            duration: 12,
        },

        {
            icon: Thermometer,
            bottom: "12%",
            right: "20%",
            size: "w-16 h-16",
            color: "text-orange-500",
            duration: 8,
        },

        {
            icon: FlaskConical,
            top: "8%",
            left: "55%",
            size: "w-16 h-16",
            color: "text-violet-500",
            duration: 9,
        },

        {
            icon: ShieldPlus,
            bottom: "24%",
            right: "35%",
            size: "w-20 h-20",
            color: "text-teal-500",
            duration: 14,
        },

        // =====================================================
        // MID DENSITY
        // =====================================================

        {
            icon: Activity,
            top: "14%",
            left: "30%",
            size: "w-14 h-14",
            color: "text-emerald-400",
            duration: 9,
        },

        {
            icon: HeartPulse,
            top: "72%",
            left: "32%",
            size: "w-14 h-14",
            color: "text-red-400",
            duration: 10,
        },

        {
            icon: Cross,
            top: "22%",
            right: "28%",
            size: "w-12 h-12",
            color: "text-cyan-400",
            duration: 8,
        },

        {
            icon: Pill,
            bottom: "30%",
            left: "45%",
            size: "w-12 h-12",
            color: "text-pink-400",
            duration: 12,
        },

        {
            icon: FlaskConical,
            top: "48%",
            left: "18%",
            size: "w-12 h-12",
            color: "text-violet-400",
            duration: 7,
        },

        {
            icon: ClipboardPlus,
            top: "55%",
            right: "16%",
            size: "w-14 h-14",
            color: "text-blue-400",
            duration: 13,
        },

        {
            icon: Stethoscope,
            bottom: "8%",
            right: "8%",
            size: "w-16 h-16",
            color: "text-emerald-500",
            duration: 10,
        },

        {
            icon: Syringe,
            top: "6%",
            right: "42%",
            size: "w-12 h-12",
            color: "text-yellow-500",
            duration: 11,
        },

        // =====================================================
        // EXTRA FLOATING TOOLS
        // =====================================================

        {
            icon: HeartPulse,
            top: "20%",
            left: "65%",
            size: "w-10 h-10",
            color: "text-rose-500",
            duration: 9,
        },

        {
            icon: Pill,
            top: "80%",
            right: "12%",
            size: "w-10 h-10",
            color: "text-fuchsia-400",
            duration: 7,
        },

        {
            icon: Stethoscope,
            top: "38%",
            left: "4%",
            size: "w-10 h-10",
            color: "text-emerald-400",
            duration: 8,
        },

        {
            icon: Microscope,
            top: "65%",
            right: "4%",
            size: "w-10 h-10",
            color: "text-sky-500",
            duration: 12,
        },

        {
            icon: ShieldPlus,
            top: "12%",
            right: "55%",
            size: "w-12 h-12",
            color: "text-teal-400",
            duration: 13,
        },

        {
            icon: Thermometer,
            top: "42%",
            right: "42%",
            size: "w-10 h-10",
            color: "text-orange-400",
            duration: 10,
        },{
            icon: Stethoscope,
            top: "12%",
            left: "8%",
            size: "w-24 h-24",
            color: "text-emerald-500",
            duration: 8,
        },

        {
            icon: Microscope,
            top: "18%",
            right: "10%",
            size: "w-20 h-20",
            color: "text-cyan-500",
            duration: 10,
        },

        {
            icon: Syringe,
            bottom: "18%",
            left: "14%",
            size: "w-16 h-16",
            color: "text-emerald-600",
            duration: 9,
        },

        {
            icon: Pill,
            top: "45%",
            right: "6%",
            size: "w-20 h-20",
            color: "text-pink-500",
            duration: 11,
        },

        {
            icon: ClipboardPlus,
            top: "62%",
            left: "7%",
            size: "w-18 h-18",
            color: "text-blue-500",
            duration: 13,
        },

        {
            icon: ScanHeart,
            top: "30%",
            left: "42%",
            size: "w-20 h-20",
            color: "text-red-500",
            duration: 12,
        },

        {
            icon: Thermometer,
            bottom: "12%",
            right: "20%",
            size: "w-16 h-16",
            color: "text-orange-500",
            duration: 8,
        },

        {
            icon: FlaskConical,
            top: "8%",
            left: "55%",
            size: "w-16 h-16",
            color: "text-violet-500",
            duration: 9,
        },

        {
            icon: ShieldPlus,
            bottom: "24%",
            right: "35%",
            size: "w-20 h-20",
            color: "text-teal-500",
            duration: 14,
        },

        // =====================================================
        // MID DENSITY
        // =====================================================

        {
            icon: Activity,
            top: "14%",
            left: "30%",
            size: "w-14 h-14",
            color: "text-emerald-400",
            duration: 9,
        },

        {
            icon: HeartPulse,
            top: "72%",
            left: "32%",
            size: "w-14 h-14",
            color: "text-red-400",
            duration: 10,
        },

        {
            icon: Cross,
            top: "22%",
            right: "28%",
            size: "w-12 h-12",
            color: "text-cyan-400",
            duration: 8,
        },

        {
            icon: Pill,
            bottom: "30%",
            left: "45%",
            size: "w-12 h-12",
            color: "text-pink-400",
            duration: 12,
        },

        {
            icon: FlaskConical,
            top: "48%",
            left: "18%",
            size: "w-12 h-12",
            color: "text-violet-400",
            duration: 7,
        },

        {
            icon: ClipboardPlus,
            top: "55%",
            right: "16%",
            size: "w-14 h-14",
            color: "text-blue-400",
            duration: 13,
        },

        {
            icon: Stethoscope,
            bottom: "8%",
            right: "8%",
            size: "w-16 h-16",
            color: "text-emerald-500",
            duration: 10,
        },

        {
            icon: Syringe,
            top: "6%",
            right: "42%",
            size: "w-12 h-12",
            color: "text-yellow-500",
            duration: 11,
        },

        // =====================================================
        // EXTRA FLOATING TOOLS
        // =====================================================

        {
            icon: HeartPulse,
            top: "20%",
            left: "65%",
            size: "w-10 h-10",
            color: "text-rose-500",
            duration: 9,
        },

        {
            icon: Pill,
            top: "80%",
            right: "12%",
            size: "w-10 h-10",
            color: "text-fuchsia-400",
            duration: 7,
        },

        {
            icon: Stethoscope,
            top: "38%",
            left: "4%",
            size: "w-10 h-10",
            color: "text-emerald-400",
            duration: 8,
        },

        {
            icon: Microscope,
            top: "65%",
            right: "4%",
            size: "w-10 h-10",
            color: "text-sky-500",
            duration: 12,
        },

        {
            icon: ShieldPlus,
            top: "12%",
            right: "55%",
            size: "w-12 h-12",
            color: "text-teal-400",
            duration: 13,
        },

        {
            icon: Thermometer,
            top: "42%",
            right: "42%",
            size: "w-10 h-10",
            color: "text-orange-400",
            duration: 10,
        },

        {
            icon: Activity,
            bottom: "14%",
            left: "60%",
            size: "w-10 h-10",
            color: "text-green-400",
            duration: 9,
        },

        {
            icon: ClipboardPlus,
            top: "28%",
            left: "22%",
            size: "w-10 h-10",
            color: "text-blue-300",
            duration: 11,
        },

        {
            icon: Syringe,
            top: "74%",
            left: "72%",
            size: "w-10 h-10",
            color: "text-yellow-400",
            duration: 8,
        },

        {
            icon: FlaskConical,
            bottom: "10%",
            left: "26%",
            size: "w-10 h-10",
            color: "text-purple-400",
            duration: 10,
        },

        {
            icon: Cross,
            top: "52%",
            left: "52%",
            size: "w-8 h-8",
            color: "text-cyan-300",
            duration: 6,
        },

        {
            icon: HeartPulse,
            top: "10%",
            left: "80%",
            size: "w-8 h-8",
            color: "text-red-300",
            duration: 7,
        },

        {
            icon: Pill,
            bottom: "40%",
            right: "48%",
            size: "w-8 h-8",
            color: "text-pink-300",
            duration: 8,
        },

        {
            icon: Thermometer,
            bottom: "20%",
            left: "48%",
            size: "w-8 h-8",
            color: "text-orange-300",
            duration: 9,
        },

        {
            icon: Stethoscope,
            top: "58%",
            right: "28%",
            size: "w-8 h-8",
            color: "text-emerald-300",
            duration: 7,
        },

        {
            icon: ShieldPlus,
            top: "34%",
            left: "74%",
            size: "w-8 h-8",
            color: "text-teal-300",
            duration: 10,
        },

        {
            icon: Activity,
            bottom: "14%",
            left: "60%",
            size: "w-10 h-10",
            color: "text-green-400",
            duration: 9,
        },

        {
            icon: ClipboardPlus,
            top: "28%",
            left: "22%",
            size: "w-10 h-10",
            color: "text-blue-300",
            duration: 11,
        },

        {
            icon: Syringe,
            top: "74%",
            left: "72%",
            size: "w-10 h-10",
            color: "text-yellow-400",
            duration: 8,
        },

        {
            icon: FlaskConical,
            bottom: "10%",
            left: "26%",
            size: "w-10 h-10",
            color: "text-purple-400",
            duration: 10,
        },

        {
            icon: Cross,
            top: "52%",
            left: "52%",
            size: "w-8 h-8",
            color: "text-cyan-300",
            duration: 6,
        },

        {
            icon: HeartPulse,
            top: "10%",
            left: "80%",
            size: "w-8 h-8",
            color: "text-red-300",
            duration: 7,
        },

        {
            icon: Pill,
            bottom: "40%",
            right: "48%",
            size: "w-8 h-8",
            color: "text-pink-300",
            duration: 8,
        },

        {
            icon: Thermometer,
            bottom: "20%",
            left: "48%",
            size: "w-8 h-8",
            color: "text-orange-300",
            duration: 9,
        },

        {
            icon: Stethoscope,
            top: "58%",
            right: "28%",
            size: "w-8 h-8",
            color: "text-emerald-300",
            duration: 7,
        },{
            icon: Stethoscope,
            top: "12%",
            left: "8%",
            size: "w-24 h-24",
            color: "text-emerald-500",
            duration: 8,
        },

        {
            icon: Microscope,
            top: "18%",
            right: "10%",
            size: "w-20 h-20",
            color: "text-cyan-500",
            duration: 10,
        },

        {
            icon: Syringe,
            bottom: "18%",
            left: "14%",
            size: "w-16 h-16",
            color: "text-emerald-600",
            duration: 9,
        },

        {
            icon: Pill,
            top: "45%",
            right: "6%",
            size: "w-20 h-20",
            color: "text-pink-500",
            duration: 11,
        },

        {
            icon: ClipboardPlus,
            top: "62%",
            left: "7%",
            size: "w-18 h-18",
            color: "text-blue-500",
            duration: 13,
        },

        {
            icon: ScanHeart,
            top: "30%",
            left: "42%",
            size: "w-20 h-20",
            color: "text-red-500",
            duration: 12,
        },

        {
            icon: Thermometer,
            bottom: "12%",
            right: "20%",
            size: "w-16 h-16",
            color: "text-orange-500",
            duration: 8,
        },

        {
            icon: FlaskConical,
            top: "8%",
            left: "55%",
            size: "w-16 h-16",
            color: "text-violet-500",
            duration: 9,
        },

        {
            icon: ShieldPlus,
            bottom: "24%",
            right: "35%",
            size: "w-20 h-20",
            color: "text-teal-500",
            duration: 14,
        },

        // =====================================================
        // MID DENSITY
        // =====================================================

        {
            icon: Activity,
            top: "14%",
            left: "30%",
            size: "w-14 h-14",
            color: "text-emerald-400",
            duration: 9,
        },

        {
            icon: HeartPulse,
            top: "72%",
            left: "32%",
            size: "w-14 h-14",
            color: "text-red-400",
            duration: 10,
        },

        {
            icon: Cross,
            top: "22%",
            right: "28%",
            size: "w-12 h-12",
            color: "text-cyan-400",
            duration: 8,
        },

        {
            icon: Pill,
            bottom: "30%",
            left: "45%",
            size: "w-12 h-12",
            color: "text-pink-400",
            duration: 12,
        },

        {
            icon: FlaskConical,
            top: "48%",
            left: "18%",
            size: "w-12 h-12",
            color: "text-violet-400",
            duration: 7,
        },

        {
            icon: ClipboardPlus,
            top: "55%",
            right: "16%",
            size: "w-14 h-14",
            color: "text-blue-400",
            duration: 13,
        },

        {
            icon: Stethoscope,
            bottom: "8%",
            right: "8%",
            size: "w-16 h-16",
            color: "text-emerald-500",
            duration: 10,
        },

        {
            icon: Syringe,
            top: "6%",
            right: "42%",
            size: "w-12 h-12",
            color: "text-yellow-500",
            duration: 11,
        },

        // =====================================================
        // EXTRA FLOATING TOOLS
        // =====================================================

        {
            icon: HeartPulse,
            top: "20%",
            left: "65%",
            size: "w-10 h-10",
            color: "text-rose-500",
            duration: 9,
        },

        {
            icon: Pill,
            top: "80%",
            right: "12%",
            size: "w-10 h-10",
            color: "text-fuchsia-400",
            duration: 7,
        },

        {
            icon: Stethoscope,
            top: "38%",
            left: "4%",
            size: "w-10 h-10",
            color: "text-emerald-400",
            duration: 8,
        },

        {
            icon: Microscope,
            top: "65%",
            right: "4%",
            size: "w-10 h-10",
            color: "text-sky-500",
            duration: 12,
        },

        {
            icon: ShieldPlus,
            top: "12%",
            right: "55%",
            size: "w-12 h-12",
            color: "text-teal-400",
            duration: 13,
        },

        {
            icon: Thermometer,
            top: "42%",
            right: "42%",
            size: "w-10 h-10",
            color: "text-orange-400",
            duration: 10,
        },

        {
            icon: Activity,
            bottom: "14%",
            left: "60%",
            size: "w-10 h-10",
            color: "text-green-400",
            duration: 9,
        },

        {
            icon: ClipboardPlus,
            top: "28%",
            left: "22%",
            size: "w-10 h-10",
            color: "text-blue-300",
            duration: 11,
        },

        {
            icon: Syringe,
            top: "74%",
            left: "72%",
            size: "w-10 h-10",
            color: "text-yellow-400",
            duration: 8,
        },

        {
            icon: FlaskConical,
            bottom: "10%",
            left: "26%",
            size: "w-10 h-10",
            color: "text-purple-400",
            duration: 10,
        },

        {
            icon: Cross,
            top: "52%",
            left: "52%",
            size: "w-8 h-8",
            color: "text-cyan-300",
            duration: 6,
        },

        {
            icon: HeartPulse,
            top: "10%",
            left: "80%",
            size: "w-8 h-8",
            color: "text-red-300",
            duration: 7,
        },

        {
            icon: Pill,
            bottom: "40%",
            right: "48%",
            size: "w-8 h-8",
            color: "text-pink-300",
            duration: 8,
        },

        {
            icon: Thermometer,
            bottom: "20%",
            left: "48%",
            size: "w-8 h-8",
            color: "text-orange-300",
            duration: 9,
        },

        {
            icon: Stethoscope,
            top: "58%",
            right: "28%",
            size: "w-8 h-8",
            color: "text-emerald-300",
            duration: 7,
        },

        {
            icon: ShieldPlus,
            top: "34%",
            left: "74%",
            size: "w-8 h-8",
            color: "text-teal-300",
            duration: 10,
        },

        {
            icon: ShieldPlus,
            top: "34%",
            left: "74%",
            size: "w-8 h-8",
            color: "text-teal-300",
            duration: 10,
        },

        {
            icon: Microscope,
            top: "65%",
            right: "4%",
            size: "w-10 h-10",
            color: "text-sky-500",
            duration: 12,
        },

        {
            icon: ShieldPlus,
            top: "12%",
            right: "55%",
            size: "w-12 h-12",
            color: "text-teal-400",
            duration: 13,
        },

        {
            icon: Thermometer,
            top: "42%",
            right: "42%",
            size: "w-10 h-10",
            color: "text-orange-400",
            duration: 10,
        },

        {
            icon: Activity,
            bottom: "14%",
            left: "60%",
            size: "w-10 h-10",
            color: "text-green-400",
            duration: 9,
        },

        {
            icon: ClipboardPlus,
            top: "28%",
            left: "22%",
            size: "w-10 h-10",
            color: "text-blue-300",
            duration: 11,
        },

        {
            icon: Syringe,
            top: "74%",
            left: "72%",
            size: "w-10 h-10",
            color: "text-yellow-400",
            duration: 8,
        },

        {
            icon: FlaskConical,
            bottom: "10%",
            left: "26%",
            size: "w-10 h-10",
            color: "text-purple-400",
            duration: 10,
        },

        {
            icon: Cross,
            top: "52%",
            left: "52%",
            size: "w-8 h-8",
            color: "text-cyan-300",
            duration: 6,
        },

        {
            icon: HeartPulse,
            top: "10%",
            left: "80%",
            size: "w-8 h-8",
            color: "text-red-300",
            duration: 7,
        },

        {
            icon: Pill,
            bottom: "40%",
            right: "48%",
            size: "w-8 h-8",
            color: "text-pink-300",
            duration: 8,
        },

        {
            icon: Thermometer,
            bottom: "20%",
            left: "48%",
            size: "w-8 h-8",
            color: "text-orange-300",
            duration: 9,
        },

        {
            icon: Stethoscope,
            top: "58%",
            right: "28%",
            size: "w-8 h-8",
            color: "text-emerald-300",
            duration: 7,
        },

        {
            icon: ShieldPlus,
            top: "34%",
            left: "74%",
            size: "w-8 h-8",
            color: "text-teal-300",
            duration: 10,
        },

        {
            icon: HeartPulse,
            top: "10%",
            left: "80%",
            size: "w-8 h-8",
            color: "text-red-300",
            duration: 7,
        },

        {
            icon: Pill,
            bottom: "40%",
            right: "48%",
            size: "w-8 h-8",
            color: "text-pink-300",
            duration: 8,
        },

        {
            icon: Thermometer,
            bottom: "20%",
            left: "48%",
            size: "w-8 h-8",
            color: "text-orange-300",
            duration: 9,
        },

        {
            icon: Stethoscope,
            top: "58%",
            right: "28%",
            size: "w-8 h-8",
            color: "text-emerald-300",
            duration: 7,
        },

        {
            icon: ShieldPlus,
            top: "34%",
            left: "74%",
            size: "w-8 h-8",
            color: "text-teal-300",
            duration: 10,
        },
    ];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">

            {/* ====================================================== */}
            {/* MAIN BACKGROUND */}
            {/* ====================================================== */}

            <div className="absolute inset-0 bg-gradient-to-br from-[#f8fffc] via-[#f2fffa] to-[#ecfff7]" />

            {/* ====================================================== */}
            {/* HUGE GLOW BLOBS */}
            {/* ====================================================== */}

            <motion.div
                animate={{
                    x: [0, 60, 0],
                    y: [0, -40, 0],
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 16,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-[-150px] left-[-150px] w-[650px] h-[650px] bg-emerald-400/20 blur-[140px] rounded-full"
            />

            <motion.div
                animate={{
                    x: [0, -80, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.08, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute bottom-[-200px] right-[-150px] w-[700px] h-[700px] bg-cyan-400/20 blur-[160px] rounded-full"
            />

            {/* ====================================================== */}
            {/* ECG WAVES */}
            {/* ====================================================== */}

            <div className="absolute inset-0 flex items-center opacity-[0.07]">

                {pulseLines.map((_, i) => (

                    <motion.div
                        key={i}
                        initial={{
                            x: "-100%",
                        }}
                        animate={{
                            x: "200%",
                        }}
                        transition={{
                            duration: 10 + i * 2,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 2,
                        }}
                        className="absolute w-[450px] h-[120px]"
                        style={{
                            top: `${10 + i * 12}%`,
                        }}
                    >

                        <svg
                            width="450"
                            height="120"
                            viewBox="0 0 450 120"
                            fill="none"
                        >

                            <path
                                d="
                  M0 60
                  L50 60
                  L80 25
                  L110 95
                  L150 35
                  L190 60
                  L230 60
                  L260 20
                  L300 100
                  L340 50
                  L450 60
                "
                                stroke="#10b981"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                        </svg>

                    </motion.div>
                ))}
            </div>

            {/* ====================================================== */}
            {/* FLOATING MEDICAL ICONS */}
            {/* ====================================================== */}

            {floatingIcons.map((item, index) => {

                const Icon = item.icon;

                return (

                    <motion.div
                        key={index}
                        animate={{
                            y: [-18, 18, -18],
                            rotate: [0, 6, -6, 0],
                            x: [-6, 6, -6],
                        }}
                        transition={{
                            duration: item.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute"
                        style={{
                            top: item.top,
                            left: item.left,
                            right: item.right,
                            bottom: item.bottom,
                        }}
                    >

                        <div className={`
              ${item.size}
              rounded-[2rem]
              bg-white/30
              backdrop-blur-2xl
              border border-white/40
              shadow-[0_20px_50px_rgba(0,0,0,0.08)]
              flex items-center justify-center
            `}>

                            <Icon className={`${item.color} w-1/2 h-1/2`} />

                        </div>

                    </motion.div>
                );
            })}

            {/* ====================================================== */}
            {/* FLOATING PARTICLES */}
            {/* ====================================================== */}

            {particles.map((_, i) => (

                <motion.div
                    key={i}
                    initial={{
                        opacity: 0.1,
                        y: 0,
                    }}
                    animate={{
                        y: [-30, 30, -30],
                        opacity: [0.05, 0.25, 0.05],
                        scale: [1, 1.4, 1],
                    }}
                    transition={{
                        duration: 5 + (i % 6),
                        repeat: Infinity,
                        delay: i * 0.15,
                    }}
                    className="absolute"
                    style={{
                        left: `${(i * 9) % 100}%`,
                        top: `${(i * 11) % 100}%`,
                    }}
                >

                    <CircleDot
                        className="text-emerald-400/30"
                        size={4 + (i % 8)}
                    />

                </motion.div>
            ))}

            {/* ====================================================== */}
            {/* MICRO GLOW DOTS */}
            {/* ====================================================== */}

            {Array.from({ length: 80 }).map((_, i) => (

                <motion.div
                    key={`glow-${i}`}
                    animate={{
                        opacity: [0.05, 0.25, 0.05],
                        scale: [1, 1.8, 1],
                    }}
                    transition={{
                        duration: 2 + (i % 5),
                        repeat: Infinity,
                        delay: i * 0.08,
                    }}
                    className="absolute rounded-full bg-emerald-400/30 blur-sm"
                    style={{
                        width: `${2 + (i % 4)}px`,
                        height: `${2 + (i % 4)}px`,
                        left: `${(i * 7) % 100}%`,
                        top: `${(i * 13) % 100}%`,
                    }}
                />
            ))}

            {/* ====================================================== */}
            {/* GRID */}
            {/* ====================================================== */}

            <div
                className="absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, #10b981 1px, transparent 1px),
            linear-gradient(to bottom, #10b981 1px, transparent 1px)
          `,
                    backgroundSize: "80px 80px",
                }}
            />

            {/* ====================================================== */}
            {/* CENTRAL MEDICAL CROSS */}
            {/* ====================================================== */}

            <motion.div
                animate={{
                    rotate: [0, 360],
                }}
                transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
            >

                <div className="relative w-[320px] h-[320px]">

                    <div className="absolute left-1/2 top-0 -translate-x-1/2 w-20 h-full bg-emerald-500 rounded-full" />

                    <div className="absolute top-1/2 left-0 -translate-y-1/2 h-20 w-full bg-emerald-500 rounded-full" />

                </div>

            </motion.div>

            {/* ====================================================== */}
            {/* HEART PULSE GLOW */}
            {/* ====================================================== */}

            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.05, 0.12, 0.05],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                }}
                className="absolute top-[38%] left-[48%]"
            >

                <HeartPulse
                    className="w-40 h-40 text-emerald-500"
                />

            </motion.div>

            {/* ====================================================== */}
            {/* RADIAL LIGHT */}
            {/* ====================================================== */}

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8),transparent_40%)]" />

            {/* ====================================================== */}
            {/* HOLOGRAM SCAN LINE */}
            {/* ====================================================== */}

            <motion.div
                animate={{
                    y: ["-10%", "110%"],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-emerald-300/10 to-transparent blur-xl"
            />

        </div>
    );
}