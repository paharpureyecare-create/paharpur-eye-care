import React from 'react';
import { useErp } from '../context/ErpContext';
import {
  Printer,
  X,
  Glasses,
  Eye,
  Calendar,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { ClinicalVisit, SpectacleOrder, RetailSale } from '../types';

export const PrintModal: React.FC = () => {
  const { printModalData, setPrintModalData, settings } = useErp();

  if (!printModalData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto print:p-0 print:static print:bg-white">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Screen Controls Header (Hidden in Print) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold text-white">
              Print Preview & Document Generator
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Document (A4 / Thermal)
            </button>
            <button
              onClick={() => setPrintModalData(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-900 text-xs bg-white print:p-0">
          
          {/* Clinic Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                {settings?.shopName || 'PAHARPUR EYE CARE'}
              </h1>
              <p className="text-xs font-semibold text-slate-600">
                {settings?.tagline || 'Advanced Eye Care, Optical Center & Microsurgery Referral Clinic'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {settings?.address || 'Paharpur Main Road, South 24 Parganas'} • Helpline: {settings?.mobile || '+91 98301 23456'} • Email: {settings?.email || 'paharpureyecare@gmail.com'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-1 rounded-md">
                {printModalData.type === 'prescription' && 'MEDICAL PRESCRIPTION (Rx)'}
                {printModalData.type === 'spectacle-order' && 'SPECTACLE JOB CARD & SLIP'}
                {printModalData.type === 'invoice' && ((printModalData.data as any).isWholesale ? 'WHOLESALE B2B TAX INVOICE' : 'TAX INVOICE / CASH BILL')}
                {printModalData.type === 'receipt' && 'CUSTOMER 360° IDENTITY & RX CARD'}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                GSTIN: {settings?.gstin || '19ABCDE1234F1Z5'} {settings?.tradeLicenseNo ? `• Lic: ${settings.tradeLicenseNo}` : ''}
              </p>
            </div>
          </div>

          {/* =========================================================================
              DOCUMENT 1: DOCTOR'S PRESCRIPTION (Rx)
             ========================================================================= */}
          {printModalData.type === 'prescription' && (() => {
            const visit = printModalData.data as ClinicalVisit;
            return (
              <div className="space-y-5">
                
                {/* Patient & Doctor Meta */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Patient Name</span>
                    <p className="font-extrabold text-slate-900">{visit.patientName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">MRD # / Age / Sex</span>
                    <p className="font-bold text-slate-800">
                      {visit.mrd} • {visit.age}Y / {visit.gender}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Consultant Doctor</span>
                    <p className="font-bold text-slate-800">{visit.doctor}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Date & Visit Type</span>
                    <p className="font-bold text-slate-800">
                      {visit.visitDate || (visit as any).date} ({visit.visitType})
                    </p>
                  </div>
                </div>

                {/* Refraction Power Prescription Table */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    Refraction & Spectacle Power
                  </h3>
                  <table className="w-full text-xs text-left border border-slate-300 border-collapse">
                    <thead className="bg-slate-100 font-bold uppercase text-[10px] border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300">Eye</th>
                        <th className="p-2 border-r border-slate-300">SPH</th>
                        <th className="p-2 border-r border-slate-300">CYL</th>
                        <th className="p-2 border-r border-slate-300">AXIS</th>
                        <th className="p-2 border-r border-slate-300">ADD</th>
                        <th className="p-2 border-r border-slate-300">Dist VA</th>
                        <th className="p-2 border-r border-slate-300">Near VA</th>
                        <th className="p-2">PD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 font-semibold">
                      <tr>
                        <td className="p-2 font-bold border-r border-slate-300 bg-slate-50">OD (Right)</td>
                        <td className="p-2 border-r border-slate-300">{visit.odPower.sph || 'Plano'}</td>
                        <td className="p-2 border-r border-slate-300">{visit.odPower.cyl || 'DS'}</td>
                        <td className="p-2 border-r border-slate-300">{visit.odPower.axis || '-'}</td>
                        <td className="p-2 border-r border-slate-300">{visit.odPower.add || '-'}</td>
                        <td className="p-2 border-r border-slate-300">{visit.odPower.distanceVa || '6/6'}</td>
                        <td className="p-2 border-r border-slate-300">{visit.odPower.nearVa || 'N6'}</td>
                        <td className="p-2">{visit.odPower.pd || '-'}</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold border-r border-slate-300 bg-slate-50">OS (Left)</td>
                        <td className="p-2 border-r border-slate-300">{visit.osPower.sph || 'Plano'}</td>
                        <td className="p-2 border-r border-slate-300">{visit.osPower.cyl || 'DS'}</td>
                        <td className="p-2 border-r border-slate-300">{visit.osPower.axis || '-'}</td>
                        <td className="p-2 border-r border-slate-300">{visit.osPower.add || '-'}</td>
                        <td className="p-2 border-r border-slate-300">{visit.osPower.distanceVa || '6/6'}</td>
                        <td className="p-2 border-r border-slate-300">{visit.osPower.nearVa || 'N6'}</td>
                        <td className="p-2">{visit.osPower.pd || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Examination & Diagnosis */}
                <div className="grid grid-cols-2 gap-4 border p-3 rounded-xl border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Clinical Diagnosis</span>
                    <p className="font-bold text-slate-900">
                      {Array.isArray(visit.diagnosis) ? visit.diagnosis.join(', ') : visit.customDiagnosis || 'Refractive Error'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">IOP / Slit Lamp</span>
                    <p className="font-semibold text-slate-800">
                      IOP OD: {visit.examination?.iopOd || '14'} mmHg • OS: {visit.examination?.iopOs || '14'} mmHg
                    </p>
                  </div>
                </div>

                {/* Prescribed Medicines (Rx) */}
                {Array.isArray(visit.medicines) && visit.medicines.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-black text-sm text-slate-950 flex items-center gap-1.5">
                      <span className="text-base font-serif italic text-teal-800">℞</span> Prescribed Medicines
                    </h3>
                    <table className="w-full text-xs text-left border border-slate-300 border-collapse">
                      <thead className="bg-slate-100 font-bold uppercase text-[10px] border-b border-slate-300">
                        <tr>
                          <th className="p-2 border-r border-slate-300">#</th>
                          <th className="p-2 border-r border-slate-300">Medicine & Form</th>
                          <th className="p-2 border-r border-slate-300">Dose & Frequency</th>
                          <th className="p-2 border-r border-slate-300">Duration</th>
                          <th className="p-2">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {visit.medicines.map((m, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-bold border-r border-slate-300">{idx + 1}</td>
                            <td className="p-2 font-bold text-slate-900 border-r border-slate-300">
                              {m.name} ({m.strength}) • {m.form}
                            </td>
                            <td className="p-2 font-semibold border-r border-slate-300">{m.dose} • {m.frequency}</td>
                            <td className="p-2 border-r border-slate-300">{m.duration}</td>
                            <td className="p-2 text-slate-700">{m.route}: {m.instruction}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Advice & Follow-up */}
                <div className="space-y-1.5 border-t pt-3">
                  <h3 className="font-bold text-xs uppercase text-slate-900">Advice & Instructions</h3>
                  <p className="text-slate-800 whitespace-pre-line bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {visit.advice || settings?.rxFooter || 'Use spectacles regularly for distant and reading activities. Avoid excessive screen time.'}
                  </p>
                  <p className="text-xs font-bold text-teal-950 mt-1">
                    Follow-up Date: {visit.followUpDays ? new Date(Date.now() + visit.followUpDays * 86400000).toLocaleDateString('en-GB') : 'As advised'}
                  </p>
                </div>

                {/* Doctor / Optometrist Signature */}
                {(() => {
                  const examinerObj = settings?.examiners?.find(ex => ex.name === visit.doctor || visit.doctor?.includes(ex.name));
                  const isOptom = examinerObj?.role === 'Optometrist' || visit.doctor?.toLowerCase().includes('optom');
                  const isRefract = examinerObj?.role === 'Refractionist' || visit.doctor?.toLowerCase().includes('refract');
                  const examinerRole = isOptom
                    ? 'Consultant Optometrist & Vision Scientist'
                    : isRefract
                    ? 'Senior Certified Refractionist'
                    : 'Consultant Ophthalmologist & Eye Surgeon';
                  const examinerQual = examinerObj?.qualification || (isOptom ? settings?.optometristQualification || 'B.Optom, DOS' : settings?.doctorQualification || 'MBBS, MS - Ophthalmology');
                  const examinerReg = examinerObj?.regNo ? `Reg: ${examinerObj.regNo}` : '';

                  return (
                    <div className="pt-12 flex justify-between items-end border-t border-slate-300">
                      <div className="text-[10px] text-slate-400 space-y-0.5">
                        <p>Rx ID: {visit.visitId || (visit as any).id} • Printed from {settings?.shopName || 'Paharpur Eye Care'}</p>
                        <p className="text-[9px] text-slate-500 italic">{settings?.rxFooter || 'Eye refraction check recommended every 12 months.'}</p>
                      </div>
                      <div className="text-center min-w-[200px]">
                        <div className="border-b border-slate-900 pb-1 font-bold text-xs">
                          {visit.doctor}
                        </div>
                        <span className="text-[10px] text-slate-700 font-bold block mt-0.5">{examinerRole}</span>
                        <span className="text-[9px] text-slate-500 block">{examinerQual} {examinerReg && `• ${examinerReg}`}</span>
                      </div>
                    </div>
                  );
                })()}

              </div>
            );
          })()}

          {/* =========================================================================
              DOCUMENT 2: SPECTACLE ORDER JOB CARD & SLIP
             ========================================================================= */}
          {printModalData.type === 'spectacle-order' && (() => {
            const order = printModalData.data as SpectacleOrder;
            return (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Order #</span>
                    <p className="font-black text-slate-900 text-sm">{order.orderId}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Customer / MRD</span>
                    <p className="font-bold text-slate-800">{order.customerName} ({order.mrd})</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Delivery Date</span>
                    <p className="font-black text-teal-900 text-sm">{order.deliveryDate}</p>
                  </div>
                </div>

                {/* Optical Specs */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b pb-1">
                    Frame & Lens Specifications
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Selected Frame</span>
                      <p className="font-black text-slate-900 text-sm">{order.frameBrand}</p>
                      <span className="text-slate-600 text-xs">SKU: {order.frameSku}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Fitted Lens</span>
                      <p className="font-black text-teal-900 text-sm">{order.lensBrand}</p>
                      <span className="text-slate-600 text-xs">Lens Code: {order.lensCode}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Balance */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Frame Rate:</span>
                    <span>₹{order.frameRate}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Lens Pair Rate:</span>
                    <span>₹{order.lensRate}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Fitting & Service Charge:</span>
                    <span>₹{order.fittingsCharge ?? (order as any).fittingCharges ?? 0}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between font-bold text-emerald-700">
                      <span>Discount:</span>
                      <span>-₹{order.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-300 pt-2">
                    <span>Total Net Amount:</span>
                    <span>₹{order.total}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Advance Received:</span>
                    <span>₹{order.advance} ({(order as any).paymentMethod || 'Advance'})</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-rose-600 border-t border-slate-300 pt-1">
                    <span>Balance Due on Delivery:</span>
                    <span>₹{order.due}</span>
                  </div>
                </div>

                <div className="text-center pt-8 border-t border-slate-300 text-[10px] text-slate-500">
                  {settings?.orderFooterNote || 'Please bring this job slip during collection. Thank you for choosing Paharpur Eye Care!'}
                </div>
              </div>
            );
          })()}

          {/* =========================================================================
              DOCUMENT 3: RETAIL / WHOLESALE TAX INVOICE
             ========================================================================= */}
          {printModalData.type === 'invoice' && (() => {
            const sale = printModalData.data as any;
            const isWholesale = Boolean(sale.isWholesale);
            const customerOrParty = sale.wholesaleCustomer || sale.dealerName || sale.customerName;

            return (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Invoice No</span>
                    <p className="font-black text-slate-900 text-sm font-mono">{sale.invoiceNumber || sale.invoiceNo}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {isWholesale ? 'B2B Dealer / Optical Shop' : 'Customer Name'}
                    </span>
                    <p className="font-bold text-slate-800">{customerOrParty} ({sale.mobile})</p>
                    {sale.gstin && <p className="text-[10px] text-slate-500 font-mono">GSTIN: {sale.gstin}</p>}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Date & Payment</span>
                    <p className="font-bold text-slate-800">{sale.date} • {sale.paymentMode || sale.paymentMethod || 'Cash'}</p>
                  </div>
                </div>

                <table className="w-full text-xs text-left border border-slate-300 border-collapse">
                  <thead className="bg-slate-100 font-bold uppercase text-[10px] border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">#</th>
                      <th className="p-2 border-r border-slate-300">Item Description & Specifications</th>
                      <th className="p-2 border-r border-slate-300 text-center">Qty</th>
                      <th className="p-2 border-r border-slate-300 text-right">Rate (₹)</th>
                      <th className="p-2 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {sale.items?.map((it: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold border-r border-slate-300">{idx + 1}</td>
                        <td className="p-2 font-bold border-r border-slate-300">{it.name}</td>
                        <td className="p-2 border-r border-slate-300 text-center font-bold">{it.quantity ?? it.qty ?? 1}</td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono">₹{it.unitPrice ?? it.rate ?? 0}</td>
                        <td className="p-2 font-bold text-right font-mono">₹{it.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <div className="w-64 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-mono">₹{sale.subTotal}</span>
                    </div>
                    {((sale.discountTotal || sale.discount || 0) > 0) && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Discount:</span>
                        <span className="font-mono">-₹{sale.discountTotal || sale.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-300 pt-1">
                      <span>Grand Total:</span>
                      <span className="font-mono">₹{sale.grandTotal ?? sale.netTotal ?? sale.subTotal}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-700">
                      <span>Amount Paid:</span>
                      <span className="font-mono">₹{sale.paid}</span>
                    </div>
                    {sale.due > 0 && (
                      <div className="flex justify-between font-bold text-rose-600">
                        <span>Balance Due:</span>
                        <span className="font-mono">₹{sale.due}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center pt-8 border-t border-slate-300 text-[10px] text-slate-400">
                  {isWholesale
                    ? 'Wholesale optical items supplied for resale. Subject to South 24 Parganas jurisdiction.'
                    : 'Goods once sold cannot be returned. Lenses carry standard manufacturer warranty. Thank you!'}
                </div>
              </div>
            );
          })()}

          {/* =========================================================================
              DOCUMENT 4: CUSTOMER 360° PROFILE & VISION CARD
             ========================================================================= */}
          {printModalData.type === 'receipt' && (() => {
            const data = printModalData.data as any;
            const customer = data.customer;
            const linkedPatient = data.linkedPatient;
            const powers = data.powers || [];

            return (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Customer ID</span>
                    <p className="font-black text-slate-900 text-sm font-mono">{customer.customerId}</p>
                    {customer.mrd && <p className="text-[10px] text-emerald-700 font-bold font-mono">Linked MRD: {customer.mrd}</p>}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Customer Name & Contact</span>
                    <p className="font-bold text-slate-800">{customer.name} ({customer.mobile})</p>
                    <p className="text-[10px] text-slate-500">{customer.village || customer.address}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Loyalty Reward Points</span>
                    <p className="font-extrabold text-cyan-800 text-sm">{customer.loyaltyPoints || 0} Points</p>
                    <p className="text-[10px] text-slate-500">Tier: {customer.segment || 'Valued Member'}</p>
                  </div>
                </div>

                {powers.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                      Recent Refraction & Power Prescription History
                    </h3>
                    <table className="w-full text-xs text-left border border-slate-300 border-collapse">
                      <thead className="bg-slate-100 font-bold uppercase text-[10px] border-b border-slate-300">
                        <tr>
                          <th className="p-2 border-r border-slate-300">Date & Eye</th>
                          <th className="p-2 border-r border-slate-300">SPH</th>
                          <th className="p-2 border-r border-slate-300">CYL</th>
                          <th className="p-2 border-r border-slate-300">AXIS</th>
                          <th className="p-2 border-r border-slate-300">ADD</th>
                          <th className="p-2 border-r border-slate-300">Dist VA</th>
                          <th className="p-2 border-r border-slate-300">Near VA</th>
                          <th className="p-2">PD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300 font-mono">
                        <tr>
                          <td className="p-2 font-bold font-sans border-r border-slate-300 bg-slate-50">
                            {powers[0].date} - OD (Right)
                          </td>
                          <td className="p-2 border-r border-slate-300">{powers[0].odPower.sph || '0.00'}</td>
                          <td className="p-2 border-r border-slate-300">{powers[0].odPower.cyl || '0.00'}</td>
                          <td className="p-2 border-r border-slate-300">{powers[0].odPower.axis || '-'}</td>
                          <td className="p-2 border-r border-slate-300">{powers[0].odPower.add || '-'}</td>
                          <td className="p-2 border-r border-slate-300">{powers[0].odPower.distanceVa || '6/6'}</td>
                          <td className="p-2 border-r border-slate-300">{powers[0].odPower.nearVa || 'N6'}</td>
                          <td className="p-2">{powers[0].odPower.pd || '62'}mm</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold font-sans border-r border-slate-300 bg-slate-50">
                            {powers[0].date} - OS (Left)
                          </td>
                          <td className="p-2 border-r border-slate-300">{powers[0].osPower.sph || '0.00'}</td>
                          <td className="p-2 border-r border-slate-300">{powers[0].osPower.cyl || '0.00'}</td>
                          <td className="p-2 border-r border-slate-300">{powers[0].osPower.axis || '-'}</td>
                          <td className="p-2 border-r border-slate-300">{powers[0].osPower.add || '-'}</td>
                          <td className="p-2 border-r border-slate-300">{powers[0].osPower.distanceVa || '6/6'}</td>
                          <td className="p-2 border-r border-slate-300">{powers[0].osPower.nearVa || 'N6'}</td>
                          <td className="p-2">{powers[0].osPower.pd || '62'}mm</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">No power history recorded yet.</p>
                )}

                <div className="grid grid-cols-2 gap-4 border p-3 rounded-xl border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Lifetime Spend</span>
                    <p className="font-bold text-slate-900 font-mono">₹{data.totalSpent || 0}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Outstanding Balance</span>
                    <p className="font-bold text-slate-900 font-mono">₹{data.totalDue || 0}</p>
                  </div>
                </div>

                <div className="text-center pt-8 border-t border-slate-300 text-[10px] text-slate-400">
                  Paharpur Eye Care Vision Card • Please carry this card during subsequent eye tests & spectacle orders.
                </div>
              </div>
            );
          })()}

          {/* =========================================================================
              DOCUMENT 5: APPOINTMENT TOKEN & BOOKING SLIP
             ========================================================================= */}
          {printModalData.type === 'appointment' && (() => {
            const apt = printModalData.data as any;
            return (
              <div className="space-y-5">
                {/* Token Badge */}
                <div className="bg-teal-50 border-2 border-teal-500 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-teal-800 tracking-wider">
                      OPD CONSULTATION TOKEN / SLIP
                    </span>
                    <h2 className="text-2xl font-black text-teal-950 font-mono mt-0.5">
                      #{apt.id}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-600 block">Date & Time:</span>
                    <span className="text-sm font-black text-slate-950">
                      {apt.date} • {apt.time}
                    </span>
                  </div>
                </div>

                {/* Patient Information Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Patient Name</span>
                    <p className="font-extrabold text-slate-900 text-sm">{apt.patientName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">MRD # / Age / Sex</span>
                    <p className="font-bold text-slate-800">
                      {apt.mrd} • {apt.age ? `${apt.age}Y` : '35Y'} / {apt.gender || 'Male'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</span>
                    <p className="font-bold text-slate-800">{apt.mobile}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Consultant Doctor</span>
                    <p className="font-bold text-teal-800">{apt.doctor}</p>
                  </div>
                </div>

                {/* Location & Village */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Village / Gram</span>
                    <p className="font-bold text-slate-900">{apt.village || 'Paharpur'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Address / District</span>
                    <p className="font-bold text-slate-900">{apt.address || apt.district || 'South 24 Parganas'}</p>
                  </div>
                </div>

                {/* Chief Complaints & History */}
                <div className="space-y-2 border border-slate-200 p-3.5 rounded-xl">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Chief Eye Complaints:</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">
                      {apt.chiefComplaints || apt.symptoms || 'General Eye Examination & Vision Check'}
                    </p>
                  </div>
                  {apt.medicalHistory && apt.medicalHistory.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Medical History:</span>
                      <p className="font-semibold text-slate-800 text-xs mt-0.5">
                        {Array.isArray(apt.medicalHistory) ? apt.medicalHistory.join(', ') : apt.medicalHistory}
                      </p>
                    </div>
                  )}
                </div>

                {/* Fee & Payment */}
                <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Consultation Fee:</span>
                    <span className="text-sm font-black text-slate-900 ml-2">₹{apt.fee || 200}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Payment Status:</span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded ml-2">
                      {apt.paidAmount ? `PAID (${apt.paymentMethod || 'Cash'})` : 'CONFIRMED'}
                    </span>
                  </div>
                </div>

                <div className="text-center pt-6 border-t border-slate-300 text-[10px] text-slate-400">
                  Please show this slip at the reception & consultation desk. Emergency Eye Helpline: +91 98301 23456.
                </div>
              </div>
            );
          })()}

        </div>

      </div>
    </div>
  );
};
