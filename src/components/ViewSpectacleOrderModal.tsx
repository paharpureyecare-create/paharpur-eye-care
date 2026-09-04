import React from 'react';
import { SpectacleOrder } from '../types';
import { useErp } from '../context/ErpContext';
import {
  X,
  Glasses,
  Eye,
  Calendar,
  Phone,
  Printer,
  Send,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
  Edit3,
  ExternalLink,
  MapPin,
  Sparkles,
  Award
} from 'lucide-react';

interface ViewSpectacleOrderModalProps {
  order: SpectacleOrder;
  onClose: () => void;
  onEdit: () => void;
  onCollectPayment: () => void;
  onPrint: () => void;
}

export const ViewSpectacleOrderModal: React.FC<ViewSpectacleOrderModalProps> = ({
  order,
  onClose,
  onEdit,
  onCollectPayment,
  onPrint
}) => {
  const {
    customers,
    setSelectedCustomerFor360,
    updateSpectacleOrderStatus,
    showToast
  } = useErp();

  const linkedCustomer = customers.find(
    c => (order.customerId && c.customerId === order.customerId) ||
         (order.mrd && c.mrd === order.mrd) ||
         c.mobile === order.mobile
  );

  const handleOpenWhatsApp = () => {
    const phone = order.whatsapp || order.mobile;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    
    let msg = `Dear ${order.customerName},\nGreetings from Paharpur Eye Care! Your Spectacle Order ${order.orderId} (Status: ${order.status}) update: Net Total: ₹${order.total}, Paid: ₹${order.advance || order.paid || 0}, Due: ₹${order.due}.`;
    if (order.status === 'Ready') {
      msg = `Dear ${order.customerName},\nGreetings from Paharpur Eye Care! 👓 Your Spectacle Order ${order.orderId} is READY for collection. Please visit our optical store with your slip to collect your customized spectacles. Due balance: ₹${order.due}. Thank you!`;
    }
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDeliver = () => {
    updateSpectacleOrderStatus(order.orderId, 'Delivered');
    showToast(`Order ${order.orderId} marked as Delivered!`, 'success');
  };

  const subTotal = order.subTotal || ((order.frameRate || 0) + (order.lensRate || 0) + (order.otherCharges || order.fittingsCharge || order.fittingCharges || 0));
  const paid = order.advance || order.paid || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
              <Glasses className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Spectacle Order Details / চশমা অর্ডার বিবরণ
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-900/80 text-cyan-300 font-bold border border-cyan-700">
                  {order.orderId}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  order.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  order.status === 'Ready' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Booked On: {order.orderDate || 'Recent'} | Delivery Target: <span className="text-slate-200 font-medium">{order.deliveryDate}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Customer & Patient MRD Header Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center text-base shrink-0">
                {order.customerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{order.customerName}</h3>
                  {linkedCustomer && (
                    <button
                      onClick={() => {
                        onClose();
                        setSelectedCustomerFor360(linkedCustomer);
                      }}
                      className="text-[11px] font-bold text-cyan-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <User className="w-3 h-3" /> View 360 Profile
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                  <span><Phone className="w-3 h-3 inline text-slate-400 mr-0.5" />{order.mobile}</span>
                  {order.mrd && (
                    <span className="font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                      MRD: {order.mrd}
                    </span>
                  )}
                </p>
                {order.address && (
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {order.address}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleOpenWhatsApp}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
              </button>
            </div>
          </div>

          {/* Eyewear Configuration Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Frame Specification */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                <Glasses className="w-4 h-4 text-cyan-600" /> Selected Frame (ফ্রেম)
              </div>
              <p className="text-sm font-bold text-slate-900">
                {order.frameBrand || order.frameName || order.frameSku || 'Custom Frame'}
              </p>
              {order.frameModel && (
                <p className="text-xs text-slate-500">Model/Color: {order.frameModel}</p>
              )}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Frame Price:</span>
                <span className="font-bold text-slate-900">₹{order.frameRate}</span>
              </div>
            </div>

            {/* Lens Specification */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                <Eye className="w-4 h-4 text-indigo-600" /> Selected Lens (লেন্স)
              </div>
              <p className="text-sm font-bold text-slate-900">
                {order.lensBrand || order.lensName || order.lensCode || 'Custom Lens'}
              </p>
              {(order.lensType || order.lensCoating) && (
                <p className="text-xs text-slate-500">
                  {order.lensType || ''} {order.lensCoating ? `(${order.lensCoating})` : ''}
                </p>
              )}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Lens Price:</span>
                <span className="font-bold text-slate-900">₹{order.lensRate}</span>
              </div>
            </div>
          </div>

          {/* Eye Power Rx Prescription Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase">
                <Eye className="w-4 h-4 text-cyan-600" /> Prescription Eye Power
              </span>
              {order.pd && (
                <span className="text-xs text-slate-600 font-medium">PD: <strong>{order.pd}</strong></span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-200 text-slate-700 font-bold">
                    <th className="p-2 border border-slate-300 text-left">Eye</th>
                    <th className="p-2 border border-slate-300">SPH</th>
                    <th className="p-2 border border-slate-300">CYL</th>
                    <th className="p-2 border border-slate-300">AXIS</th>
                    <th className="p-2 border border-slate-300">ADD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-slate-300 font-bold bg-cyan-50 text-cyan-900 text-left">OD (Right)</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold">{order.odSph || order.odPower?.sph || '—'}</td>
                    <td className="p-2 border border-slate-300 font-mono">{order.odCyl || order.odPower?.cyl || '—'}</td>
                    <td className="p-2 border border-slate-300 font-mono">{order.odAxis || order.odPower?.axis || '—'}</td>
                    <td className="p-2 border border-slate-300 font-mono">{order.odAdd || order.odPower?.add || '—'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 font-bold bg-indigo-50 text-indigo-900 text-left">OS (Left)</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold">{order.osSph || order.osPower?.sph || '—'}</td>
                    <td className="p-2 border border-slate-300 font-mono">{order.osCyl || order.osPower?.cyl || '—'}</td>
                    <td className="p-2 border border-slate-300 font-mono">{order.osAxis || order.osPower?.axis || '—'}</td>
                    <td className="p-2 border border-slate-300 font-mono">{order.osAdd || order.osPower?.add || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {order.labNotes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900">
                <strong>Lab Instructions:</strong> {order.labNotes}
              </div>
            )}
          </div>

          {/* Pricing, Payment and Due Status */}
          <div className="bg-slate-900 text-white rounded-xl p-4.5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[10px] text-slate-400 uppercase">Subtotal</p>
                <p className="text-sm font-bold mt-0.5">₹{subTotal}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[10px] text-slate-400 uppercase">Discounts</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">-₹{order.discount || 0}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[10px] text-slate-400 uppercase">Net Bill Total</p>
                <p className="text-base font-extrabold text-white mt-0.5">₹{order.total}</p>
              </div>
              <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-2">
                <p className="text-[10px] text-cyan-300 uppercase font-bold">Outstanding Due</p>
                <p className={`text-base font-extrabold mt-0.5 ${order.due > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  ₹{order.due}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className="text-slate-400">Total Paid Amount: <strong className="text-emerald-400 font-bold">₹{paid}</strong></span>
              <span className="text-slate-400">Technician: <strong className="text-slate-200">{order.assignedTechnician || 'In-House'}</strong></span>
            </div>
          </div>

        </div>

        {/* 1-Click Action Buttons Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              Edit Order (এডিট)
            </button>

            {order.due > 0 && (
              <button
                onClick={onCollectPayment}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Collect Payment (টাকা জমা)
              </button>
            )}

            {order.status !== 'Delivered' && (
              <button
                onClick={handleDeliver}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Deliver (ডেলিভারি)
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Print Invoice / Slip
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
