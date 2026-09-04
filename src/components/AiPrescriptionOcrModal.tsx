import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { extractPrescriptionFromImage, PrescriptionOcrResult } from '../services/aiService';
import {
  Sparkles,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  RotateCcw,
  Glasses,
  Check,
  Eye
} from 'lucide-react';

interface AiPrescriptionOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToClinical?: (data: PrescriptionOcrResult) => void;
}

export const AiPrescriptionOcrModal: React.FC<AiPrescriptionOcrModalProps> = ({
  isOpen,
  onClose,
  onApplyToClinical
}) => {
  const { setClinicalDraft, setActiveTab, showToast, patients } = useErp();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<PrescriptionOcrResult | null>(null);
  const [selectedPatientMRD, setSelectedPatientMRD] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64: string) => {
    setAnalyzing(true);
    setExtractedData(null);

    try {
      const result = await extractPrescriptionFromImage(base64);
      setExtractedData(result);
      showToast('Prescription scanned successfully! Please verify values before applying.', 'success');
    } catch (err) {
      showToast('OCR scan failed. Please enter values manually.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveAndTransferToClinical = () => {
    if (!extractedData) return;

    if (onApplyToClinical) {
      onApplyToClinical(extractedData);
    } else {
      // Direct load to clinical draft
      setClinicalDraft((prev: any) => ({
        ...prev,
        patientName: extractedData.patientName || prev.patientName || '',
        mrd: selectedPatientMRD || prev.mrd || '',
        doctor: extractedData.doctor || prev.doctor || 'Dr. S. Roy',
        odPower: {
          ...prev.odPower,
          ...extractedData.odPower
        },
        osPower: {
          ...prev.osPower,
          ...extractedData.osPower
        },
        pd: extractedData.pd || prev.pd || '62',
        notes: `${prev.notes ? prev.notes + ' | ' : ''}AI Prescription Image OCR scanned.`
      }));

      setActiveTab('entry-center');
    }

    showToast('Extracted prescription values loaded into Clinical Entry Center!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-center justify-between border-b border-teal-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/30 flex items-center justify-center border border-teal-400/30 text-teal-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">AI Prescription Image Reader (OCR)</h3>
                <span className="text-[10px] bg-teal-400/20 text-teal-200 border border-teal-400/30 px-2 py-0.5 rounded-full font-semibold">
                  Optical Power Vision
                </span>
              </div>
              <p className="text-xs text-teal-100/70">
                Upload handwritten or printed eye prescription image to extract OD/OS Refraction details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Left Column: Image Upload & Preview */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-teal-600" />
              1. Upload Prescription Slip Image
            </h4>

            {!imagePreview ? (
              <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-teal-50/50 transition-all text-center group">
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                  <Camera className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-800">Click to Browse or Drag & Drop</p>
                <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP, PDF slip images</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 group">
                <img
                  src={imagePreview}
                  alt="Prescription"
                  referrerPolicy="no-referrer"
                  className="w-full max-h-64 object-contain mx-auto"
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="px-3 py-1.5 bg-white text-slate-800 rounded-xl text-xs font-bold cursor-pointer hover:bg-teal-50">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => processImage(imagePreview)}
                    className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Re-scan
                  </button>
                </div>
              </div>
            )}

            {/* Link to Existing Patient */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Link to Patient (Optional):
              </label>
              <select
                value={selectedPatientMRD}
                onChange={(e) => setSelectedPatientMRD(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500 text-slate-800"
              >
                <option value="">-- Select Patient from Registry --</option>
                {patients.map((p) => (
                  <option key={p.mrd} value={p.mrd}>
                    {p.name} ({p.mrd}) - {p.mobile}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column: AI Extraction & Power Verification Screen */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              2. Extracted Power & Confirmation Review
            </h4>

            {analyzing ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-slate-800">AI Vision Engine analyzing prescription...</p>
                <p className="text-xs text-slate-500">Detecting SPH, CYL, AXIS, ADD & Visual Acuity</p>
              </div>
            ) : extractedData ? (
              <div className="space-y-3 animate-in fade-in text-xs">
                
                {/* Patient / Doctor Meta */}
                <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Patient Name</span>
                    <input
                      type="text"
                      value={extractedData.patientName || ''}
                      onChange={(e) => setExtractedData({ ...extractedData, patientName: e.target.value })}
                      placeholder="Patient Name"
                      className="w-full font-bold text-slate-900 focus:outline-none border-b border-transparent focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Doctor</span>
                    <input
                      type="text"
                      value={extractedData.doctor || ''}
                      onChange={(e) => setExtractedData({ ...extractedData, doctor: e.target.value })}
                      placeholder="Doctor Name"
                      className="w-full font-medium text-slate-800 focus:outline-none border-b border-transparent focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Right Eye (OD) Refraction Box */}
                <div className="bg-white p-3 rounded-xl border border-teal-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-900 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-teal-600" />
                      Right Eye (OD - ডান চোখ)
                    </span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                      Distance & Near
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold">SPH</span>
                      <input
                        type="text"
                        value={extractedData.odPower?.sph || ''}
                        onChange={(e) => setExtractedData({
                          ...extractedData,
                          odPower: { ...extractedData.odPower, sph: e.target.value }
                        })}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold">CYL</span>
                      <input
                        type="text"
                        value={extractedData.odPower?.cyl || ''}
                        onChange={(e) => setExtractedData({
                          ...extractedData,
                          odPower: { ...extractedData.odPower, cyl: e.target.value }
                        })}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold">AXIS</span>
                      <input
                        type="text"
                        value={extractedData.odPower?.axis || ''}
                        onChange={(e) => setExtractedData({
                          ...extractedData,
                          odPower: { ...extractedData.odPower, axis: e.target.value }
                        })}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold">ADD</span>
                      <input
                        type="text"
                        value={extractedData.odPower?.add || ''}
                        onChange={(e) => setExtractedData({
                          ...extractedData,
                          odPower: { ...extractedData.odPower, add: e.target.value }
                        })}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Left Eye (OS) Refraction Box */}
                <div className="bg-white p-3 rounded-xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      Left Eye (OS - বাম চোখ)
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      Distance & Near
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold">SPH</span>
                      <input
                        type="text"
                        value={extractedData.osPower?.sph || ''}
                        onChange={(e) => setExtractedData({
                          ...extractedData,
                          osPower: { ...extractedData.osPower, sph: e.target.value }
                        })}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold">CYL</span>
                      <input
                        type="text"
                        value={extractedData.osPower?.cyl || ''}
                        onChange={(e) => setExtractedData({
                          ...extractedData,
                          osPower: { ...extractedData.osPower, cyl: e.target.value }
                        })}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold">AXIS</span>
                      <input
                        type="text"
                        value={extractedData.osPower?.axis || ''}
                        onChange={(e) => setExtractedData({
                          ...extractedData,
                          osPower: { ...extractedData.osPower, axis: e.target.value }
                        })}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold">ADD</span>
                      <input
                        type="text"
                        value={extractedData.osPower?.add || ''}
                        onChange={(e) => setExtractedData({
                          ...extractedData,
                          osPower: { ...extractedData.osPower, add: e.target.value }
                        })}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>You have full control to edit or adjust any power value before transferring.</span>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <FileText className="w-8 h-8 text-slate-300" />
                <p className="text-xs">Upload an image on the left to extract prescription power.</p>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveAndTransferToClinical}
            disabled={!extractedData || analyzing}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-transform hover:scale-105"
          >
            <Check className="w-4 h-4" />
            Confirm & Load into Clinical Entry Center
          </button>
        </div>

      </div>
    </div>
  );
};
