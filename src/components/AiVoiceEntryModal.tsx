import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { parseVoiceTranscript, StructuredVoiceResult } from '../services/aiService';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
  Save,
  RotateCcw,
  Volume2
} from 'lucide-react';

interface AiVoiceEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiVoiceEntryModal: React.FC<AiVoiceEntryModalProps> = ({ isOpen, onClose }) => {
  const { addPatient, setClinicalDraft, setActiveTab, showToast } = useErp();

  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [structuredData, setStructuredData] = useState<StructuredVoiceResult | null>(null);

  if (!isOpen) return null;

  const handleToggleRecord = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please type the spoken sentence.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-IN'; // Also supports English/Banglish
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognition.onresult = async (event: any) => {
      const speech = event.results[0][0].transcript;
      setTranscript(speech);
      handleProcessTranscript(speech);
    };

    recognition.start();
  };

  const handleProcessTranscript = async (text: string) => {
    if (!text.trim()) return;
    setProcessing(true);
    try {
      const result = await parseVoiceTranscript(text);
      setStructuredData(result);
    } catch (err) {
      showToast('Error structuring voice input', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmAndSave = () => {
    if (!structuredData) return;

    // Create new patient record
    const newPatient = {
      name: structuredData.name || 'Voice Registered Patient',
      age: structuredData.age || 35,
      gender: (structuredData.gender || 'Male') as any,
      mobile: structuredData.mobile || '',
      village: structuredData.address || 'Paharpur',
      postOffice: 'Paharpur',
      policeStation: 'Paharpur',
      district: 'Murshidabad',
      state: 'West Bengal',
      pincode: '742101',
      occupation: 'General',
      notes: structuredData.notes || 'Voice Registered'
    };

    const savedPatient = addPatient(newPatient);

    // If powers are present, load into Clinical Draft
    if (structuredData.odSph || structuredData.osSph) {
      setClinicalDraft((prev: any) => ({
        ...prev,
        mrd: savedPatient.mrd,
        patientName: savedPatient.name,
        odPower: {
          ...prev.odPower,
          sph: structuredData.odSph || prev.odPower.sph,
          cyl: structuredData.odCyl || prev.odPower.cyl,
          axis: structuredData.odAxis || prev.odPower.axis,
          add: structuredData.odAdd || prev.odPower.add
        },
        osPower: {
          ...prev.osPower,
          sph: structuredData.osSph || prev.osPower.sph,
          cyl: structuredData.osCyl || prev.osPower.cyl,
          axis: structuredData.osAxis || prev.osPower.axis,
          add: structuredData.osAdd || prev.osPower.add
        }
      }));
      setActiveTab('entry-center');
    } else {
      setActiveTab('patients');
    }

    showToast(`Patient ${savedPatient.name} registered via Voice AI successfully!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-center justify-between border-b border-teal-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/30 flex items-center justify-center border border-teal-400/30 text-teal-200">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">AI Voice Dictation & Data Entry</h3>
                <span className="text-[10px] bg-teal-400/20 text-teal-200 border border-teal-400/30 px-2 py-0.5 rounded-full font-semibold">
                  বাংলা / Voice NLP
                </span>
              </div>
              <p className="text-xs text-teal-100/70">
                Speak patient details & refraction power in natural Bengali or English
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          
          {/* Recording Circle */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
            <button
              onClick={handleToggleRecord}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                isRecording
                  ? 'bg-rose-500 hover:bg-rose-600 animate-pulse ring-8 ring-rose-500/20'
                  : 'bg-teal-600 hover:bg-teal-700 hover:scale-105'
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {isRecording ? 'Listening... Speak now (বাংলা বা ইংলিশ বলুন)' : 'Click Microphone to Start Speaking'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Example: "নতুন রোগী রহিম মিয়া, বয়স ৩৫, মোবাইল ৯৮৩২১৫৫১৩১, OD পাওয়ার মাইনাস ১..."
              </p>
            </div>
          </div>

          {/* Transcript input/edit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Spoken Transcript (or type manually):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Spoken text appears here..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
              <button
                onClick={() => handleProcessTranscript(transcript)}
                disabled={!transcript.trim() || processing}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Parse AI
              </button>
            </div>
          </div>

          {/* Structured Confirmation Screen */}
          {structuredData && (
            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Extracted Structured Fields Review:
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Name:</span>
                  <input
                    type="text"
                    value={structuredData.name || ''}
                    onChange={(e) => setStructuredData({ ...structuredData, name: e.target.value })}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Age:</span>
                  <input
                    type="number"
                    value={structuredData.age || 0}
                    onChange={(e) => setStructuredData({ ...structuredData, age: parseInt(e.target.value) || 0 })}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Mobile:</span>
                  <input
                    type="text"
                    value={structuredData.mobile || ''}
                    onChange={(e) => setStructuredData({ ...structuredData, mobile: e.target.value })}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">OD SPH:</span>
                  <input
                    type="text"
                    value={structuredData.odSph || ''}
                    onChange={(e) => setStructuredData({ ...structuredData, odSph: e.target.value })}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">OD CYL:</span>
                  <input
                    type="text"
                    value={structuredData.odCyl || ''}
                    onChange={(e) => setStructuredData({ ...structuredData, odCyl: e.target.value })}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">OD AXIS:</span>
                  <input
                    type="text"
                    value={structuredData.odAxis || ''}
                    onChange={(e) => setStructuredData({ ...structuredData, odAxis: e.target.value })}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAndSave}
            disabled={!structuredData}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-transform hover:scale-105"
          >
            <UserCheck className="w-4 h-4" />
            Confirm & Save to ERP
          </button>
        </div>

      </div>
    </div>
  );
};
