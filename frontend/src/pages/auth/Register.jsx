import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, AlertCircle, User, Phone, Award, BookOpen, Stethoscope, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "../../components/common/Button";
import AnimatedBackground from "../../components/ui/AnimatedBackground";
import { authService } from "../../services/authService";
import { cn } from "../../lib/utils";
const logoBireena = "/logo.png";

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Doctor", // Default to Doctor
    specializations: "",
    degrees: "",
    medals: "",
    history: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        setError("Please fill all basic details");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }
    setError("");
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (authService.register) {
        await authService.register(formData);
      }
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError("Registration failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative">
      <AnimatedBackground />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg glass rounded-[3rem] shadow-2xl shadow-primary-dark/5 border border-white/20 overflow-hidden"
      >
        <div className="p-10 bg-primary text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl opacity-20 -mr-16 -mt-16" />
          <Link to="/" className="inline-flex items-center gap-3 mb-6 relative z-10 hover:scale-105 transition-transform">
            <img src={logoBireena} alt="Logo" className="w-80 object-contain" />
            <span className="font-bold text-3xl tracking-tighter">Medico</span>
          </Link>
          <h2 className="text-xl font-bold relative z-10 opacity-80">
            {step === 1 ? "Step 1: Account Details" : "Step 2: Professional Profile"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-primary-dark tracking-widest ml-1 uppercase">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Dr. John Doe"
                      className="w-full h-14 pl-12 pr-4 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-primary-dark tracking-widest ml-1 uppercase">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full h-14 pl-10 pr-4 bg-white/50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-primary-dark tracking-widest ml-1 uppercase">Phone</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full h-14 pl-10 pr-4 bg-white/50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-primary-dark tracking-widest ml-1 uppercase">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full h-14 pl-12 pr-4 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-primary-dark tracking-widest ml-1 uppercase">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="w-full h-14 pl-12 pr-4 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <Button 
                  type="button"
                  onClick={nextStep}
                  className="w-full h-16 font-bold text-lg shadow-xl shadow-primary/10 rounded-2xl flex items-center justify-center gap-2"
                >
                  Next Step <ChevronRight className="w-5 h-5" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary-dark tracking-widest ml-1 uppercase">Select Role</label>
                  <div className="flex gap-2">
                    {["Doctor", "Patient"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFormData({...formData, role: r})}
                        className={cn(
                          "flex-1 py-4 rounded-2xl font-bold transition-all border",
                          formData.role === r 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                            : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.role === "Doctor" ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-primary-dark tracking-widest ml-1 uppercase">Specializations</label>
                      <div className="relative group">
                        <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={formData.specializations}
                          onChange={(e) => setFormData({...formData, specializations: e.target.value})}
                          placeholder="Cardiology, Neuro Surgery..."
                          className="w-full h-14 pl-12 pr-4 bg-white/50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-primary-dark tracking-widest ml-1 uppercase">Degrees</label>
                        <div className="relative group">
                          <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            required
                            value={formData.degrees}
                            onChange={(e) => setFormData({...formData, degrees: e.target.value})}
                            placeholder="MBBS, MD..."
                            className="w-full h-14 pl-10 pr-4 bg-white/50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-primary-dark tracking-widest ml-1 uppercase">Medals / Awards</label>
                        <div className="relative group">
                          <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={formData.medals}
                            onChange={(e) => setFormData({...formData, medals: e.target.value})}
                            placeholder="Optional..."
                            className="w-full h-14 pl-10 pr-4 bg-white/50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-primary-dark tracking-widest ml-1 uppercase">Medical History Summary</label>
                    <textarea
                      required
                      value={formData.history}
                      onChange={(e) => setFormData({...formData, history: e.target.value})}
                      placeholder="Briefly describe any chronic conditions, allergies, or past surgeries..."
                      className="w-full h-32 p-4 bg-white/50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 h-16 bg-gray-50 text-gray-400 rounded-2xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <Button 
                    disabled={isSubmitting}
                    className="flex-[2] h-16 font-bold text-lg shadow-xl shadow-primary/20 rounded-2xl"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Complete Profile"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-sm font-medium text-gray-500">
            Already registered? <Link to="/login" className="text-primary-dark font-bold hover:underline">Log in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
