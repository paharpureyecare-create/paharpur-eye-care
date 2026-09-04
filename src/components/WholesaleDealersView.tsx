import React, { useState, useMemo } from 'react';
import { Dealer, WholesaleSale, SaleItem, LensMaster } from '../types';
import { useErp } from '../context/ErpContext';
import {
  Store,
  Building2,
  Receipt,
  Search,
  Plus,
  Phone,
  Send,
  Printer,
  ChevronRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  CreditCard,
  X,
  Package,
  Layers,
  Edit2
} from 'lucide-react';

export const WholesaleDealersView: React.FC = () => {
  const {
    dealers,
    wholesaleSales,
    lenses,
    saveDealer,
    createWholesaleSale,
    updateWholesaleSale,
    setPrintModalData,
    showToast,
    role
  } = useErp();

  const [activeTab, setActiveTab] = useState<'dealers' | 'invoices' | 'profit-matrix'>('dealers');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showAddDealerModal, setShowAddDealerModal] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [selectedDealerForDetails, setSelectedDealerForDetails] = useState<Dealer | null>(null);

  // New Dealer Form State
  const [dealerForm, setDealerForm] = useState<Partial<Dealer>>({
    shopName: '',
    ownerName: '',
    mobile: '',
    whatsapp: '',
    address: '',
    village: '',
    postOffice: '',
    policeStation: '',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    pinCode: '',
    gstin: '',
    creditLimit: 50000,
    paymentTerms: '30 Days Credit',
    openingDue: 0,
    currentDue: 0,
    totalPurchase: 0,
    status: 'Active'
  });

  // New Wholesale Invoice Form State
  const [selectedDealerId, setSelectedDealerId] = useState('');
  const [customShopName, setCustomShopName] = useState('');
  const [customMobile, setCustomMobile] = useState('');
  const [customGstin, setCustomGstin] = useState('');
  const [orderItems, setOrderItems] = useState<
    {
      lensCode: string;
      name: string;
      brand: string;
      power: string;
      quantity: number;
      wholesaleRate: number;
      discount: number;
      total: number;
    }[]
  >([]);
  const [invoiceDiscountPercent, setInvoiceDiscountPercent] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('Bank Transfer');
  const [deliveryStatus, setDeliveryStatus] = useState<WholesaleSale['deliveryStatus']>('Delivered');
  const [invoiceNotes, setInvoiceNotes] = useState('');

  // Selected lens item picker in invoice maker
  const [pickerLensCode, setPickerLensCode] = useState('');
  const [pickerQty, setPickerQty] = useState<number>(10);
  const [pickerRate, setPickerRate] = useState<number>(0);
  const [pickerPowerText, setPickerPowerText] = useState('');

  // KPIs
  const totalDealers = dealers.length;
  const totalWholesaleSalesCount = wholesaleSales.length;
  const totalWholesaleRevenue = wholesaleSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalWholesaleReceivables = dealers.reduce((sum, d) => sum + (d.currentDue || 0), 0);

  // Filtered Dealers
  const filteredDealers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return dealers;
    return dealers.filter(
      d =>
        d.shopName.toLowerCase().includes(q) ||
        d.ownerName.toLowerCase().includes(q) ||
        d.mobile.includes(q) ||
        d.dealerId.toLowerCase().includes(q) ||
        (d.village && d.village.toLowerCase().includes(q)) ||
        (d.gstin && d.gstin.toLowerCase().includes(q))
    );
  }, [dealers, searchQuery]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return wholesaleSales;
    return wholesaleSales.filter(
      s =>
        s.invoiceNumber.toLowerCase().includes(q) ||
        s.wholesaleCustomer.toLowerCase().includes(q) ||
        s.mobile.includes(q) ||
        (s.dealerName && s.dealerName.toLowerCase().includes(q))
    );
  }, [wholesaleSales, searchQuery]);

  const handleCreateDealer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerForm.shopName || !dealerForm.ownerName || !dealerForm.mobile) {
      showToast('Shop Name, Owner Name, and Mobile are required', 'error');
      return;
    }

    const nextId = `DLR-${100 + dealers.length + 1}`;
    const newDealer: Dealer = {
      dealerId: nextId,
      shopName: dealerForm.shopName.trim(),
      ownerName: dealerForm.ownerName.trim(),
      mobile: dealerForm.mobile.trim(),
      whatsapp: dealerForm.whatsapp?.trim() || dealerForm.mobile.trim(),
      altMobile: dealerForm.altMobile?.trim(),
      address: `${dealerForm.village ? dealerForm.village + ', ' : ''}${dealerForm.district} ${dealerForm.pinCode || ''}`.trim(),
      village: dealerForm.village?.trim(),
      postOffice: dealerForm.postOffice?.trim(),
      policeStation: dealerForm.policeStation?.trim(),
      district: dealerForm.district || 'South 24 Parganas',
      state: dealerForm.state || 'West Bengal',
      pinCode: dealerForm.pinCode?.trim(),
      gstin: dealerForm.gstin?.trim(),
      creditLimit: Number(dealerForm.creditLimit) || 50000,
      paymentTerms: dealerForm.paymentTerms || '30 Days Credit',
      openingDue: Number(dealerForm.openingDue) || 0,
      currentDue: Number(dealerForm.openingDue) || 0,
      totalPurchase: 0,
      status: 'Active'
    };

    saveDealer(newDealer);
    setShowAddDealerModal(false);
    setDealerForm({
      shopName: '',
      ownerName: '',
      mobile: '',
      whatsapp: '',
      address: '',
      village: '',
      postOffice: '',
      policeStation: '',
      district: 'South 24 Parganas',
      state: 'West Bengal',
      pinCode: '',
      gstin: '',
      creditLimit: 50000,
      paymentTerms: '30 Days Credit',
      openingDue: 0,
      currentDue: 0,
      totalPurchase: 0,
      status: 'Active'
    });
  };

  const handleAddItemToInvoice = () => {
    if (!pickerLensCode) {
      showToast('Please select a lens product', 'error');
      return;
    }
    const found = lenses.find(l => l.lensCode === pickerLensCode);
    if (!found) return;

    const rate = pickerRate > 0 ? pickerRate : found.wholesaleRate;
    const itemTotal = pickerQty * rate;

    setOrderItems(prev => [
      ...prev,
      {
        lensCode: found.lensCode,
        name: `${found.company} ${found.brand} (${found.category})`,
        brand: found.brand,
        power: pickerPowerText || `${found.category} Stock`,
        quantity: pickerQty,
        wholesaleRate: rate,
        discount: 0,
        total: itemTotal
      }
    ]);

    // Reset picker
    setPickerLensCode('');
    setPickerQty(10);
    setPickerRate(0);
    setPickerPowerText('');
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations for wholesale invoice
  const itemsSubtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (itemsSubtotal * invoiceDiscountPercent) / 100;
  const taxableAmount = itemsSubtotal - discountAmount;
  const invoiceGrandTotal = Math.round(taxableAmount);
  const calculatedDue = Math.max(0, invoiceGrandTotal - paidAmount);

  const handleGenerateWholesaleInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      showToast('Please add at least one lens item', 'error');
      return;
    }

    const selectedDealer = dealers.find(d => d.dealerId === selectedDealerId);
    const shopName = selectedDealer ? selectedDealer.shopName : customShopName.trim();
    const mobile = selectedDealer ? selectedDealer.mobile : customMobile.trim();
    const gstin = selectedDealer ? selectedDealer.gstin : customGstin.trim();

    if (!shopName || !mobile) {
      showToast('Dealer/Shop Name and Mobile number are required', 'error');
      return;
    }

    const saleItems: SaleItem[] = orderItems.map((item, idx) => ({
      id: `WHS-ITM-${Date.now()}-${idx}`,
      itemType: 'Lens',
      code: item.lensCode,
      name: `${item.name} [${item.power}]`,
      quantity: item.quantity,
      unitPrice: item.wholesaleRate,
      discount: item.discount,
      taxPercent: 0,
      total: item.total
    }));

    const createdSale = createWholesaleSale({
      dealerId: selectedDealer?.dealerId,
      dealerName: selectedDealer?.shopName,
      wholesaleCustomer: shopName,
      stockistName: 'Paharpur Eye Care Stockist Hub',
      gstin,
      mobile,
      items: saleItems,
      subTotal: itemsSubtotal,
      discount: discountAmount,
      discountType: 'Percentage',
      taxTotal: 0,
      grandTotal: invoiceGrandTotal,
      paid: paidAmount,
      due: calculatedDue,
      paymentMode,
      salesperson: `${role} Desk`,
      deliveryStatus,
      paymentStatus: calculatedDue === 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Due',
      notes: invoiceNotes
    });

    setShowNewInvoiceModal(false);
    setOrderItems([]);
    setPaidAmount(0);
    setInvoiceDiscountPercent(0);
    setInvoiceNotes('');

    // Offer to print invoice
    setPrintModalData({
      type: 'invoice',
      data: {
        ...createdSale,
        isWholesale: true,
        dealer: selectedDealer
      }
    });
  };

  const handlePrintWholesaleInvoice = (sale: WholesaleSale) => {
    const dealer = dealers.find(d => d.dealerId === sale.dealerId);
    setPrintModalData({
      type: 'invoice',
      data: {
        ...sale,
        isWholesale: true,
        dealer
      }
    });
  };

  const handleOpenWhatsApp = (d: Dealer) => {
    const msg = `Dear ${d.ownerName} (${d.shopName}), Greetings from Paharpur Eye Care Lens Stockist. Your current outstanding balance is ₹${d.currentDue}. For fresh lens stock dispatch, please reply here.`;
    const phone = d.whatsapp || d.mobile;
    const clean = phone.replace(/[^0-9]/g, '');
    const finalPhone = clean.length === 10 ? `91${clean}` : clean;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Store className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white">Lens Stockist & Wholesale (B2B)</h1>
            </div>
            <p className="text-xs text-indigo-200/80 mt-1 max-w-2xl">
              Manage optical shop dealers, B2B wholesale lens orders, bulk dispatch invoices, dealer credit ledgers, and profit margin matrices.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowAddDealerModal(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
            >
              <Building2 className="w-4 h-4 text-indigo-300" /> Add Dealer Shop
            </button>
            <button
              onClick={() => setShowNewInvoiceModal(true)}
              className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Wholesale Invoice
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-indigo-200">Registered Dealers</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{totalDealers} Optical Shops</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-indigo-200">Total B2B Dispatches</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{totalWholesaleSalesCount} Invoices</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-indigo-200">Wholesale Turnover</p>
            <p className="text-xl font-extrabold text-emerald-300 mt-0.5">₹{totalWholesaleRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-indigo-200">Dealer Outstanding Dues</p>
            <p className="text-xl font-extrabold text-amber-300 mt-0.5">₹{totalWholesaleReceivables.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab('dealers')}
          className={`py-3 px-5 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'dealers'
              ? 'border-indigo-600 text-indigo-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" /> Optical Shop Dealers Master ({dealers.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`py-3 px-5 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'invoices'
              ? 'border-indigo-600 text-indigo-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" /> Wholesale Sales Invoices ({wholesaleSales.length})
        </button>
        <button
          onClick={() => setActiveTab('profit-matrix')}
          className={`py-3 px-5 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'profit-matrix'
              ? 'border-indigo-600 text-indigo-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Percent className="w-4 h-4" /> B2B vs Retail Profit Engine
        </button>
      </div>

      {/* TAB 1: DEALERS MASTER */}
      {activeTab === 'dealers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Dealer Shop Name, Owner, Mobile, Location, GSTIN..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <button
              onClick={() => setShowAddDealerModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Optical Dealer
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Dealer ID & Shop Name</th>
                    <th className="p-3.5">Owner & Contact</th>
                    <th className="p-3.5">Location & GSTIN</th>
                    <th className="p-3.5">Credit Limit & Terms</th>
                    <th className="p-3.5">Total Purchase</th>
                    <th className="p-3.5">Current Due</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredDealers.length > 0 ? (
                    filteredDealers.map(d => (
                      <tr key={d.dealerId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-sm">
                              {d.shopName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{d.shopName}</div>
                              <span className="font-mono text-[11px] text-slate-400">ID: {d.dealerId}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-medium text-slate-800">{d.ownerName}</div>
                          <div className="text-slate-500 font-mono text-[11px]">{d.mobile}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="text-slate-700">{d.village || d.address}</div>
                          {d.gstin && <div className="text-[11px] font-mono text-indigo-600 font-medium">GST: {d.gstin}</div>}
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">Limit: ₹{d.creditLimit.toLocaleString()}</div>
                          <div className="text-[11px] text-slate-500">{d.paymentTerms}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">₹{(d.totalPurchase || 0).toLocaleString()}</div>
                          <div className="text-[11px] text-slate-400">Last: {d.lastPurchaseDate || 'N/A'}</div>
                        </td>

                        <td className="p-3.5">
                          <span className={`font-bold ${(d.currentDue || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            ₹{(d.currentDue || 0).toLocaleString()}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenWhatsApp(d)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="WhatsApp Chat"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDealerId(d.dealerId);
                                setShowNewInvoiceModal(true);
                              }}
                              className="px-2.5 py-1 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              New Order <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No wholesale dealer shops found matching the search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WHOLESALE INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Invoice #, Optical Shop, Mobile..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <button
              onClick={() => setShowNewInvoiceModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Wholesale Invoice
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Invoice # & Date</th>
                    <th className="p-3.5">Dealer / Optical Shop</th>
                    <th className="p-3.5">Dispatched Items</th>
                    <th className="p-3.5">Grand Total</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5">Delivery Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map(s => (
                      <tr key={s.invoiceNumber} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-indigo-900">{s.invoiceNumber}</span>
                          <div className="text-slate-400 text-[11px]">{s.date}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{s.wholesaleCustomer}</div>
                          <div className="text-slate-500 text-[11px]">{s.mobile}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="text-slate-700 font-medium">
                            {s.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                          </div>
                          <div className="text-[10px] text-slate-400">{s.items.reduce((acc, i) => acc + i.quantity, 0)} total pcs</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 text-sm">₹{s.grandTotal.toLocaleString()}</div>
                          {s.discount > 0 && <div className="text-[11px] text-emerald-600">Disc: ₹{s.discount}</div>}
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : s.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {s.paymentStatus}
                          </span>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Paid: ₹{s.paid} | <span className={s.due > 0 ? 'text-red-600 font-semibold' : 'text-emerald-600'}>Due: ₹{s.due}</span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Truck className="w-3 h-3 text-indigo-600" /> {s.deliveryStatus}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handlePrintWholesaleInvoice(s)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" /> Print Invoice
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No wholesale sales records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROFIT & MARGIN ENGINE */}
      {activeTab === 'profit-matrix' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Lens Pricing & Margin Structure
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Comparison of Purchase Cost, Wholesale Rate (B2B Dealer Price), and Retail MRP with auto-calculated profit margins.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Lens Model / Company</th>
                    <th className="p-3">Design & Coating</th>
                    <th className="p-3">Purchase Cost (A)</th>
                    <th className="p-3">Wholesale Rate (B)</th>
                    <th className="p-3">Wholesale Margin %</th>
                    <th className="p-3">Retail Rate (C)</th>
                    <th className="p-3">Retail Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {lenses.map(l => {
                    const cost = l.purchaseRate;
                    const ws = l.wholesaleRate;
                    const rt = l.retailRate;

                    const wsProfit = ws - cost;
                    const wsMargin = cost > 0 ? ((wsProfit / cost) * 100).toFixed(1) : '0';

                    const rtProfit = rt - cost;
                    const rtMargin = cost > 0 ? ((rtProfit / cost) * 100).toFixed(1) : '0';

                    return (
                      <tr key={l.lensCode} className="hover:bg-slate-50/80">
                        <td className="p-3 font-semibold text-slate-800">
                          {l.company} {l.brand}
                          <span className="block text-[10px] text-slate-400 font-mono">{l.lensCode}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-slate-700">{l.category}</span>
                          <span className="block text-[10px] text-cyan-700 font-medium">{l.coating}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-700">₹{cost}</td>
                        <td className="p-3 font-mono font-bold text-indigo-700">
                          ₹{ws} <span className="text-[10px] text-slate-400 block">+₹{wsProfit}/pc</span>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            {wsMargin}%
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-700">
                          ₹{rt} <span className="text-[10px] text-slate-400 block">+₹{rtProfit}/pc</span>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {rtMargin}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD DEALER */}
      {showAddDealerModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" /> Register B2B Optical Dealer / Stockist Client
              </h3>
              <button onClick={() => setShowAddDealerModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDealer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Optical Shop / Party Name *</label>
                  <input
                    type="text"
                    required
                    value={dealerForm.shopName}
                    onChange={e => setDealerForm({ ...dealerForm, shopName: e.target.value })}
                    placeholder="e.g. Kakdwip Eye Opticals"
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Owner / Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={dealerForm.ownerName}
                    onChange={e => setDealerForm({ ...dealerForm, ownerName: e.target.value })}
                    placeholder="e.g. Tapan Mondal"
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={dealerForm.mobile}
                    onChange={e => setDealerForm({ ...dealerForm, mobile: e.target.value })}
                    placeholder="e.g. 9832011223"
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={dealerForm.whatsapp}
                    onChange={e => setDealerForm({ ...dealerForm, whatsapp: e.target.value })}
                    placeholder="e.g. 9832011223"
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={dealerForm.gstin}
                    onChange={e => setDealerForm({ ...dealerForm, gstin: e.target.value })}
                    placeholder="e.g. 19AAACP1234F1Z8"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Village / Town / Market</label>
                  <input
                    type="text"
                    value={dealerForm.village}
                    onChange={e => setDealerForm({ ...dealerForm, village: e.target.value })}
                    placeholder="e.g. Kakdwip Bazar"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={dealerForm.district}
                    onChange={e => setDealerForm({ ...dealerForm, district: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={dealerForm.pinCode}
                    onChange={e => setDealerForm({ ...dealerForm, pinCode: e.target.value })}
                    placeholder="e.g. 743347"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={dealerForm.creditLimit}
                    onChange={e => setDealerForm({ ...dealerForm, creditLimit: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={dealerForm.paymentTerms}
                    onChange={e => setDealerForm({ ...dealerForm, paymentTerms: e.target.value })}
                    placeholder="e.g. 30 Days Credit"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Opening Due (₹)</label>
                  <input
                    type="number"
                    value={dealerForm.openingDue}
                    onChange={e => setDealerForm({ ...dealerForm, openingDue: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-red-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddDealerModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Save Dealer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE WHOLESALE INVOICE */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" /> Create Wholesale B2B Invoice
              </h3>
              <button onClick={() => setShowNewInvoiceModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateWholesaleInvoice} className="space-y-4 text-xs">
              {/* Dealer Selector */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Select Registered Dealer</label>
                    <select
                      value={selectedDealerId}
                      onChange={e => {
                        setSelectedDealerId(e.target.value);
                        const d = dealers.find(item => item.dealerId === e.target.value);
                        if (d) {
                          setCustomShopName(d.shopName);
                          setCustomMobile(d.mobile);
                          setCustomGstin(d.gstin || '');
                        }
                      }}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
                    >
                      <option value="">-- Or Enter Walk-in Optical Shop --</option>
                      {dealers.map(d => (
                        <option key={d.dealerId} value={d.dealerId}>
                          {d.shopName} ({d.ownerName}) - Due: ₹{d.currentDue}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Shop / Party Name *</label>
                    <input
                      type="text"
                      required
                      value={customShopName}
                      onChange={e => setCustomShopName(e.target.value)}
                      placeholder="e.g. Kakdwip Eye Opticals"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Contact Mobile *</label>
                    <input
                      type="text"
                      required
                      value={customMobile}
                      onChange={e => setCustomMobile(e.target.value)}
                      placeholder="e.g. 9832011223"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Party GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={customGstin}
                      onChange={e => setCustomGstin(e.target.value)}
                      placeholder="e.g. 19AAACP1234F1Z8"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Add Lens Items Picker */}
              <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3">
                <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-indigo-600" /> Add Lens Stock Items
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-600 font-medium block mb-1">Select Lens Product</label>
                    <select
                      value={pickerLensCode}
                      onChange={e => {
                        setPickerLensCode(e.target.value);
                        const l = lenses.find(item => item.lensCode === e.target.value);
                        if (l) {
                          setPickerRate(l.wholesaleRate);
                        }
                      }}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
                    >
                      <option value="">-- Choose Lens from Stock --</option>
                      {lenses.map(l => (
                        <option key={l.lensCode} value={l.lensCode}>
                          {l.company} {l.brand} ({l.category}) - Stock: {l.currentStock} pcs @ ₹{l.wholesaleRate}/pc
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 font-medium block mb-1">Quantity (Pairs/Pcs)</label>
                    <input
                      type="number"
                      min="1"
                      value={pickerQty}
                      onChange={e => setPickerQty(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 font-medium block mb-1">Wholesale Rate (₹)</label>
                    <input
                      type="number"
                      value={pickerRate}
                      onChange={e => setPickerRate(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Specific Power Breakdown (e.g. SPH -1.00 to -3.00, CYL -0.50)"
                    value={pickerPowerText}
                    onChange={e => setPickerPowerText(e.target.value)}
                    className="flex-1 p-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddItemToInvoice}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs cursor-pointer whitespace-nowrap"
                  >
                    + Add Item
                  </button>
                </div>
              </div>

              {/* Order Items Table */}
              {orderItems.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold">
                      <tr>
                        <th className="p-2">Item Description & Power</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Wholesale Rate</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {orderItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium text-slate-800">
                            {item.name}
                            <span className="block text-[10px] text-slate-500 font-normal">{item.power}</span>
                          </td>
                          <td className="p-2 text-center font-bold">{item.quantity}</td>
                          <td className="p-2 text-right font-mono">₹{item.wholesaleRate}</td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">₹{item.total}</td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  No lens items added to this invoice yet.
                </div>
              )}

              {/* Payment & Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Special Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={invoiceDiscountPercent}
                      onChange={e => setInvoiceDiscountPercent(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Paid Amount (₹)</label>
                      <input
                        type="number"
                        value={paidAmount}
                        onChange={e => setPaidAmount(Number(e.target.value))}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Payment Mode</label>
                      <select
                        value={paymentMode}
                        onChange={e => setPaymentMode(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Bank Transfer">Bank Transfer / NEFT</option>
                        <option value="UPI">UPI / QR Code</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Credit">Credit (30 Days)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({orderItems.reduce((acc, i) => acc + i.quantity, 0)} pcs):</span>
                    <span className="font-mono">₹{itemsSubtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({invoiceDiscountPercent}%):</span>
                      <span className="font-mono">-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span className="font-mono">₹{invoiceGrandTotal}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-100">
                    <span className="text-emerald-700">Paid Amount:</span>
                    <span className="font-mono text-emerald-700">₹{paidAmount}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs text-red-600">
                    <span>Outstanding Due:</span>
                    <span className="font-mono">₹{calculatedDue}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Generate & Print Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
