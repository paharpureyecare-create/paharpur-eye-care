import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { MovementType } from '../types';
import {
  Boxes,
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Truck,
  RotateCcw,
  ShoppingBag,
  Glasses,
  Filter
} from 'lucide-react';

export const PurchasesAndLedgerView: React.FC = () => {
  const { stockMovements, setQuickModal, suppliers } = useErp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('All');

  const movementTypes: string[] = [
    'All',
    'Purchase',
    'Spectacle Order',
    'Retail Sale',
    'Wholesale Sale',
    'Adjustment',
    'Return',
    'Damage'
  ];

  const filtered = (stockMovements || []).filter(m => {
    const q = (search || '').trim().toLowerCase();
    const iName = (m.itemName || '').toLowerCase();
    const iCode = (m.itemCode || '').toLowerCase();
    const ref = (m.reference || '').toLowerCase();
    const usr = (m.user || '').toLowerCase();

    const matchesSearch =
      !q ||
      iName.includes(q) ||
      iCode.includes(q) ||
      ref.includes(q) ||
      usr.includes(q);

    const matchesMovement = filterType === 'All' || m.movementType === filterType;
    const matchesItemType = itemTypeFilter === 'All' || m.itemType === itemTypeFilter;

    return matchesSearch && matchesMovement && matchesItemType;
  });

  const totalIn = stockMovements.reduce((acc, m) => acc + m.qtyIn, 0);
  const totalOut = stockMovements.reduce((acc, m) => acc + m.qtyOut, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Boxes className="w-5 h-5 text-teal-600" />
              Central Stock Movement Ledger (স্টক লেজার ও ট্রানজ্যাকশন)
            </h1>
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              Audit-Proof Trail
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time automated ledger logging every purchase, spectacle order deduction, retail sale, and return
          </p>
        </div>

        <button
          id="btn-add-purchase-stock"
          onClick={() => setQuickModal('new-purchase')}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Truck className="w-4 h-4" />
          + Record Stock Purchase (PO)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Stock Received (In)</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">+{totalIn} Units</p>
          <span className="text-[11px] text-slate-500">Purchases & Supplier inward</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Stock Dispatched (Out)</span>
          <p className="text-2xl font-black text-rose-600 mt-1">-{totalOut} Units</p>
          <span className="text-[11px] text-slate-500">Spectacle orders & retail sales</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Logged Movements</span>
          <p className="text-2xl font-black text-teal-700 mt-1">{stockMovements.length} Records</p>
          <span className="text-[11px] text-slate-500">Fully synchronized with Google Sheets</span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search item, code, invoice/order reference..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          <select
            value={itemTypeFilter}
            onChange={e => setItemTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="All">All Item Types</option>
            <option value="Lens">Lenses</option>
            <option value="Frame">Frames</option>
            <option value="Medicine">Medicines</option>
            <option value="Accessory">Accessories</option>
          </select>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            {movementTypes.map(mt => (
              <option key={mt} value={mt}>
                {mt === 'All' ? 'All Movements' : mt}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Log ID & Date</th>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4">Reference #</th>
                <th className="py-3 px-4 text-center">Qty In (+)</th>
                <th className="py-3 px-4 text-center">Qty Out (-)</th>
                <th className="py-3 px-4">Logged By & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(mov => (
                <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                  
                  {/* ID & Date */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{mov.id}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{mov.date}</span>
                  </td>

                  {/* Item */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{mov.itemName}</div>
                    <div className="text-[10px] text-slate-500">
                      Code: <span className="font-semibold text-teal-800">{mov.itemCode}</span> • Type: {mov.itemType}
                    </div>
                  </td>

                  {/* Movement Type */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        mov.movementType === 'Purchase'
                          ? 'bg-emerald-100 text-emerald-800'
                          : mov.movementType === 'Spectacle Order'
                          ? 'bg-amber-100 text-amber-800'
                          : mov.movementType === 'Retail Sale'
                          ? 'bg-blue-100 text-blue-800'
                          : mov.movementType === 'Wholesale Sale'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {mov.qtyIn > 0 ? <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-rose-600" />}
                      {mov.movementType}
                    </span>
                  </td>

                  {/* Reference */}
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {mov.reference}
                    </span>
                  </td>

                  {/* Qty In */}
                  <td className="py-3.5 px-4 text-center">
                    {mov.qtyIn > 0 ? (
                      <span className="font-extrabold text-emerald-600 text-sm">+{mov.qtyIn}</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* Qty Out */}
                  <td className="py-3.5 px-4 text-center">
                    {mov.qtyOut > 0 ? (
                      <span className="font-extrabold text-rose-600 text-sm">-{mov.qtyOut}</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* User & Notes */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="font-bold text-slate-800 text-[11px]">{mov.user}</div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{mov.notes || '-'}</p>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
