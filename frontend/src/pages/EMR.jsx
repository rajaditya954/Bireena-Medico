
import React, { useState, useEffect } from "react";
import { 
  Stethoscope, 
  Search, 
  Activity, 
  Pill, 
  FileText, 
  Save, 
  Plus, 
  X, 
  History,
  CheckCircle2,
  Loader2,
  Upload,
  Calendar,
  FileSearch,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { patientService } from "../services/patientService";
import { emrService } from "../services/emrService";
import { Button } from "../components/common/Button";
import { cn } from "../lib/utils";

export default function EMR() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState("draft"); // "draft" or "history"
  
  // EMR Form State
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", duration: "" });
  const [clinicalFindings, setClinicalFindings] = useState({ bp: "", pulse: "", temp: "", spo2: "" });
  
  // Report Upload State
  const [reportType, setReportType] = useState("General Report");

  useEffect(() => {
    const fetchPatients = async () => {
      const p = await patientService.getAll();
      setPatients(p);
      setLoading(false);
    };
    fetchPatients();
  }, []);

  const loadTimeline = async () => {
    if (!selectedPatient) return;
    setTimelineLoading(true);
    const data = await emrService.getPatientTimeline(selectedPatient.patientId || selectedPatient.id);
    setTimeline(data);
    setTimelineLoading(false);
  };

  useEffect(() => {
    if (selectedPatient) {
      loadTimeline();
    }
  }, [selectedPatient]);

  const addMedicine = () => {
    if (newMed.name && newMed.dosage) {
      setMedicines([...medicines, newMed]);
      setNewMed({ name: "", dosage: "", duration: "" });
    }
  };

  const removeMedicine = (idx) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!selectedPatient) return;
    setIsSubmitting(true);
    try {
      await emrService.addPrescription({
        patientId: selectedPatient.patientId || selectedPatient.id,
        patientName: selectedPatient.name,
        notes,
        medicines,
        vitals: clinicalFindings,
        doctorName: JSON.parse(localStorage.getItem("medico_session"))?.name || "Dr. Current"
      });
      // Reset Form
      setNotes("");
      setMedicines([]);
      setClinicalFindings({ bp: "", pulse: "", temp: "", spo2: "" });
      loadTimeline();
      setActiveView("history");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedPatient) return;

    setIsUploading(true);
    try {
      // Mock upload
      await emrService.uploadReport({
        patientId: selectedPatient.patientId || selectedPatient.id,
        fileName: file.name,
        type: reportType,
        fileUrl: "https://example.com/reports/" + file.name,
        uploadedBy: JSON.parse(localStorage.getItem("medico_session"))?.name || "Dr. Staff"
      });
      loadTimeline();
    } catch (error) {
       console.error("Upload failed", error);
    } finally {
       setIsUploading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.patientId && p.patientId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
      {/* Patient Selection Sidebar */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
           <div className="mb-6 flex-shrink-0">
              <h3 className="text-xl font-black text-primary-dark tracking-tight mb-4 italic">Patient Queue</h3>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search Registry..." 
                  className="w-full h-11 pl-11 pr-4 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none ring-primary/5 focus:ring-4 transition-all"
                />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin text-primary opacity-20" /></div>
              ) : (
                filteredPatients.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => setSelectedPatient(p)}
                    className={cn(
                      "w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3 group",
                      selectedPatient?.id === p.id 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white border-transparent hover:bg-gray-50 text-gray-600"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex flex-shrink-0 items-center justify-center font-black transition-colors text-xs",
                      selectedPatient?.id === p.id ? "bg-white/20" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                    )}>
                      {p.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                       <p className="text-xs font-black truncate tracking-tight">{p.name}</p>
                       <p className={cn("text-[9px] font-bold uppercase tracking-widest", selectedPatient?.id === p.id ? "text-white/60" : "text-gray-300")}>
                         {p.patientId || 'New'} • {p.gender}
                       </p>
                    </div>
                  </button>
                ))
              )}
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar pb-10">
        {!selectedPatient ? (
          <div className="flex-1 bg-white rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center">
             <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mb-6">
                <Stethoscope className="w-10 h-10 text-primary opacity-20" />
             </div>
             <h2 className="text-2xl font-black text-primary-dark tracking-tighter italic">Clinical Workplace</h2>
             <p className="text-gray-400 font-medium max-w-sm mt-2">Please select a patient from the registry to begin clinical evaluation and prescription drafting.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* View Switcher */}
            <div className="flex items-center justify-between">
              <div className="p-1 bg-gray-100 rounded-2xl flex gap-1">
                <button 
                  onClick={() => setActiveView("draft")}
                  className={cn(
                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    activeView === "draft" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  Clinical Draft
                </button>
                <button 
                  onClick={() => setActiveView("history")}
                  className={cn(
                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    activeView === "history" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  Historical Timeline
                </button>
              </div>
              <div className="flex items-center gap-3">
                 <div className="text-right">
                    <p className="text-sm font-black text-primary-dark tracking-tight">{selectedPatient.name}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedPatient.patientId}</p>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-primary-dark font-black text-xs">
                    {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                 </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeView === "draft" ? (
                <motion.div 
                  key="draft"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Clinical Findings */}
                  <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: "Blood Pressure", icon: Activity, placeholder: "120/80", value: clinicalFindings.bp, key: "bp", color: "text-primary" },
                      { label: "Heart Rate", icon: Activity, placeholder: "72 BPM", value: clinicalFindings.pulse, key: "pulse", color: "text-red-500" },
                      { label: "Temperature", icon: Activity, placeholder: "98.6°F", value: clinicalFindings.temp, key: "temp", color: "text-amber-500" },
                      { label: "SpO2 Level", icon: Activity, placeholder: "98%", value: clinicalFindings.spo2, key: "spo2", color: "text-blue-500" },
                    ].map((v) => (
                      <div key={v.key} className="space-y-1">
                        <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1 group font-mono">
                          <v.icon className={cn("w-3 h-3", v.color)} /> {v.label}
                        </label>
                        <input 
                          type="text" 
                          className={cn("w-full text-xl font-black outline-none border-b border-transparent focus:border-gray-100 transition-all placeholder:text-gray-200", v.color)} 
                          placeholder={v.placeholder} 
                          value={v.value} 
                          onChange={e => setClinicalFindings({...clinicalFindings, [v.key]: e.target.value})} 
                        />
                      </div>
                    ))}
                  </div>

                  {/* Diagnosis Notes */}
                  <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary"><FileText className="w-5 h-5" /></div>
                        <h3 className="text-xl font-black text-primary-dark tracking-tight italic">Diagnosis & Impressions</h3>
                    </div>
                    <textarea 
                        className="w-full h-40 p-6 bg-gray-50 border-none rounded-2xl text-sm font-medium italic text-gray-600 outline-none resize-none placeholder:text-gray-300"
                        placeholder="Summarize patient symptoms, observations, and clinical preliminary diagnosis..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Prescriptions */}
                  <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600"><Pill className="w-5 h-5" /></div>
                      <h3 className="text-xl font-black text-primary-dark tracking-tight italic">Prescribed Medication</h3>
                    </div>

                    <div className="space-y-3 mb-8">
                        {medicines.map((med, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl group transition-all hover:bg-emerald-50 border border-transparent hover:border-emerald-100">
                            <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[9px] font-black text-emerald-600 shadow-sm">0{idx+1}</span>
                            <div className="flex-1">
                                <p className="text-sm font-black text-gray-900 italic tracking-tight">{med.name}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{med.dosage} • {med.duration}</p>
                            </div>
                            <button onClick={() => removeMedicine(idx)} className="p-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"><X className="w-4 h-4" /></button>
                          </div>
                        ))}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50/50 p-3 rounded-[1.5rem] border border-dashed border-gray-200">
                          <input type="text" className="bg-white border-none h-11 px-4 rounded-xl text-xs font-bold outline-none italic" placeholder="Drug Name" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} />
                          <input type="text" className="bg-white border-none h-11 px-4 rounded-xl text-xs font-bold outline-none italic" placeholder="Dosage (500mg)" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} />
                          <input type="text" className="bg-white border-none h-11 px-4 rounded-xl text-xs font-bold outline-none italic" placeholder="Duration" value={newMed.duration} onChange={e => setNewMed({...newMed, duration: e.target.value})} />
                          <button onClick={addMedicine} className="h-11 bg-primary text-white rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all outline-none">Add</button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-50">
                        <Button 
                          onClick={handleSubmit} 
                          disabled={isSubmitting || (!notes && medicines.length === 0)}
                          className="h-14 px-12 rounded-2xl flex items-center gap-3 shadow-xl shadow-primary/20 active:scale-95 transition-all text-sm font-black italic"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5" /> Persist Record</>}
                        </Button>
                    </div>
                  </div>

                  {/* Media Upload */}
                  <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                       <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600"><Upload className="w-5 h-5" /></div>
                       <h3 className="text-xl font-black text-primary-dark tracking-tight italic">Reports & Media</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Report Category</label>
                          <select 
                            value={reportType}
                            onChange={e => setReportType(e.target.value)}
                            className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/5 transition-all italic"
                          >
                             <option>Lab Report</option>
                             <option>X-Ray / MRI Scan</option>
                             <option>Discharge Summary</option>
                             <option>Vaccination Record</option>
                             <option>Consent Forms</option>
                          </select>
                       </div>
                       <div className="flex flex-col justify-end">
                          <label className="cursor-pointer group flex-1">
                             <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                             <div className={cn(
                               "h-14 w-full rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-3 transition-all group-hover:border-blue-300 group-hover:bg-blue-50/30",
                               isUploading && "opacity-50"
                             )}>
                                {isUploading ? <Loader2 className="animate-spin w-5 h-5 text-blue-600" /> : <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />}
                                <span className="text-xs font-black uppercase text-gray-400 group-hover:text-blue-600 tracking-wider">
                                   {isUploading ? "Uploading Payload..." : "Broadcast File to EMR"}
                                </span>
                             </div>
                          </label>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[400px]">
                     <div className="flex items-center gap-3 mb-12">
                        <History className="w-6 h-6 text-primary" />
                        <h3 className="text-2xl font-black text-primary-dark tracking-tighter italic">Patient Timeline</h3>
                     </div>

                     {timelineLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                           <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hydrating Timeline Records...</p>
                        </div>
                     ) : timeline.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center">
                           <FileSearch className="w-16 h-16 text-gray-100 mb-4" />
                           <p className="text-gray-400 font-medium italic">No clinical history found for this profile.</p>
                        </div>
                     ) : (
                        <div className="relative pl-10 space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-50">
                           {timeline.map((entry, i) => (
                             <div key={entry.id} className="relative">
                                <div className={cn(
                                  "absolute -left-10 w-10 h-10 rounded-2xl flex items-center justify-center z-10 border-4 border-white shadow-sm transition-transform hover:scale-110",
                                  entry.type === 'prescription' ? "bg-primary text-white" : "bg-blue-600 text-white"
                                )}>
                                   {entry.type === 'prescription' ? <Pill className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                </div>
                                
                                <div className="group bg-gray-50 border border-transparent hover:bg-white hover:border-gray-100 p-8 rounded-[2.5rem] transition-all hover:shadow-xl hover:shadow-gray-200/50">
                                   <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-3">
                                         <h4 className="text-lg font-black text-primary-dark tracking-tight italic">
                                            {entry.type === 'prescription' ? "Clinical Consultation" : entry.type}
                                         </h4>
                                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-1 bg-white border border-gray-100 rounded-full">
                                            {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                         </span>
                                      </div>
                                      <p className="text-[10px] font-black text-primary-forest uppercase tracking-widest opacity-40">BY {entry.doctorName || entry.uploadedBy}</p>
                                   </div>

                                   {entry.type === 'prescription' ? (
                                      <div className="space-y-4">
                                         <p className="text-sm text-gray-600 font-medium italic leading-relaxed bg-white/50 p-4 rounded-xl border border-white/50">
                                            {entry.notes}
                                         </p>
                                         <div className="flex flex-wrap gap-2">
                                            {entry.medicines.map((m, idx) => (
                                              <span key={idx} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                                 {m.name} ({m.dosage})
                                              </span>
                                            ))}
                                         </div>
                                      </div>
                                   ) : (
                                      <div className="flex items-center justify-between bg-white/50 p-4 rounded-xl border border-white/50">
                                         <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">PDF</div>
                                            <div>
                                               <p className="text-sm font-black text-primary-dark">{entry.fileName}</p>
                                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{entry.type}</p>
                                            </div>
                                         </div>
                                         <a href={entry.fileUrl} className="p-3 bg-white text-blue-600 rounded-xl border border-blue-50 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                            <ExternalLink className="w-4 h-4" />
                                         </a>
                                      </div>
                                   )}
                                </div>
                             </div>
                           ))}
                        </div>
                     )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
