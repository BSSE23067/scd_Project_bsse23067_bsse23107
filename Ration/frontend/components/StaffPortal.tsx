
import API_BASE_URL from "../config/api";
import React, { useState } from 'react';
import { Family, InventoryItem, Transaction } from '../types';
interface StaffPortalProps {
  families: Family[];
  inventory: InventoryItem[];
  transactions: Transaction[];
  setFamilies: React.Dispatch<React.SetStateAction<Family[]>>;
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({ 
  families, 
  inventory, 
  transactions, 
  setFamilies, 
  setInventory, 
  setTransactions 
}) => {
  const [regForm, setRegForm] = useState({ id: '', name: '', initialBalance: 100 });
  const [stockForm, setStockForm] = useState({ center: '', item: '', quantity: 0 });
  const [distForm, setDistForm] = useState({ familyId: '', center: '', item: '', quantity: 0 });

  
  const handleRegister = async (e: React.FormEvent) => {
    
  e.preventDefault();
console.log("REGISTER CLICKED");
  if (!regForm.id || !regForm.name) {
    alert("All fields required");
    return;
  }

  await fetch(`${API_BASE_URL}/api/families`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      family_id: regForm.id.toUpperCase(),
      name: regForm.name,
      ration_balance: regForm.initialBalance
    })
  });

  // Re-fetch updated data
  const updatedFamilies = await fetch(
    `${API_BASE_URL}/api/families`
  ).then(res => res.json())
  .then(data => data.map((item: any) => ({
    familyId: item.family_id || item.familyId,
    name: item.name,
    rationBalance: item.ration_balance || item.rationBalance
  })));

  setFamilies(updatedFamilies);
  setRegForm({ id: "", name: "", initialBalance: 100 });

  alert("Family Registered Successfully");
};


  const handleUpdateStock = async (e: React.FormEvent) => {
  e.preventDefault();
console.log("REGISTER CLICKED");
  if (!stockForm.center || !stockForm.item || stockForm.quantity <= 0) {
    alert("Valid details required");
    return;
  }

  await fetch(`${API_BASE_URL}/api/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      center_name: stockForm.center,
      item_name: stockForm.item,
      quantity: stockForm.quantity
    })
  });

  // Re-fetch updated inventory
  const updatedInventory = await fetch(
    `${API_BASE_URL}/api/inventory`
  ).then(res => res.json())
  .then(data => data.map((item: any) => ({
    id: item.id,
    centerName: item.center_name || item.centerName,
    itemName: item.item_name || item.itemName,
    quantity: item.quantity
  })));

  setInventory(updatedInventory);
  setStockForm({ center: "", item: "", quantity: 0 });

  alert("Inventory Updated");
};


  const handleDistribute = async (e: React.FormEvent) => {
  e.preventDefault();
  const { familyId, center, item, quantity } = distForm;
  const amount = Number(quantity);

  if (!familyId || !center || !item || amount <= 0) {
    alert("Please fill in all fields with valid values");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        family_id: familyId.toUpperCase(),
        center_name: center,
        item_name: item,
        quantity: amount
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(`Error: ${errorData.error || 'Failed to record distribution'}`);
      return;
    }

    // Re-fetch all affected data
    const [updatedFamilies, updatedInventory, updatedTransactions] =
      await Promise.all([
        fetch(`${API_BASE_URL}/api/families`).then(r => r.json()).then(data => 
          data.map((item: any) => ({
            familyId: item.family_id || item.familyId,
            name: item.name,
            rationBalance: item.ration_balance || item.rationBalance
          }))
        ),
        fetch(`${API_BASE_URL}/api/inventory`).then(r => r.json()).then(data =>
          data.map((item: any) => ({
            id: item.id,
            centerName: item.center_name || item.centerName,
            itemName: item.item_name || item.itemName,
            quantity: item.quantity
          }))
        ),
        fetch(`${API_BASE_URL}/api/transactions`).then(r => r.json()).then(data =>
          data.map((item: any) => ({
            id: item.id,
            familyId: item.family_id || item.familyId,
            itemName: item.item_name || item.itemName,
            centerName: item.center_name || item.centerName,
            quantity: item.quantity,
            date: item.created_at || item.date
          }))
        )
      ]);

    setFamilies(updatedFamilies);
    setInventory(updatedInventory);
    setTransactions(updatedTransactions);

    setDistForm({ familyId: "", center: "", item: "", quantity: 0 });
    alert("Distribution Recorded Successfully");
  } catch (error) {
    alert("Failed to record distribution. Please try again.");
    console.error(error);
  }
};


  const handleExportData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      families,
      inventory,
      transactions
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relieftrack-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">
             <i className="fas fa-lock text-[8px]"></i>
             Secure Staff Terminal
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Logistics Dashboard</h1>
          <p className="text-slate-500 mt-2">Manage beneficiary records and district-level distribution pipelines.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
           <div className="flex gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center min-w-[140px]">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Families</span>
                 <span className="text-3xl font-black text-blue-600">{families.length}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center min-w-[140px]">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Distributions</span>
                 <span className="text-3xl font-black text-emerald-600">{transactions.length}</span>
              </div>
           </div>
           <button 
             onClick={handleExportData}
             className="bg-white border border-slate-200 hover:border-blue-400 text-slate-700 font-bold px-6 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 active:scale-95 group"
           >
             <i className="fas fa-download text-blue-500 group-hover:animate-bounce"></i>
             <div className="text-left">
                <p className="leading-none text-sm font-black">Export System Data</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Download JSON Report</p>
             </div>
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
            <i className="fas fa-user-plus text-xl"></i>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-6">Beneficiary Enrollment</h3>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">System ID</label>
              <input 
                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-400 outline-none transition-all font-medium"
                placeholder="Unique ID (e.g. FAM999)" 
                value={regForm.id}
                onChange={e => setRegForm({...regForm, id: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Head of Family</label>
              <input 
                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-400 outline-none transition-all font-medium"
                placeholder="Full Legal Name" 
                value={regForm.name}
                onChange={e => setRegForm({...regForm, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Initial Quota</label>
              <input 
                type="number"
                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-400 outline-none transition-all font-medium"
                value={regForm.initialBalance}
                onChange={e => setRegForm({...regForm, initialBalance: Number(e.target.value)})}
              />
            </div>
            <button   type="submit"  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 transform active:scale-[0.98]">
              Confirm Enrollment
            </button>
          </form>
        </div>

        {/* Stock Management */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6">
            <i className="fas fa-truck-ramp-box text-xl"></i>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-6">Supply Intake</h3>
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <input 
              className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-amber-50/50 focus:border-amber-400 outline-none transition-all font-medium"
              placeholder="Distribution Center" 
              value={stockForm.center}
              onChange={e => setStockForm({...stockForm, center: e.target.value})}
            />
            <input 
              className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-amber-50/50 focus:border-amber-400 outline-none transition-all font-medium"
              placeholder="Commodity Type (e.g. Rice)" 
              value={stockForm.item}
              onChange={e => setStockForm({...stockForm, item: e.target.value})}
            />
            <input 
              type="number"
              className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-amber-50/50 focus:border-amber-400 outline-none transition-all font-medium"
              placeholder="Incoming Quantity" 
              value={stockForm.quantity || ''}
              onChange={e => setStockForm({...stockForm, quantity: Number(e.target.value)})}
            />
            <button   type="submit" className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-amber-100 transform active:scale-[0.98]">
              Update Inventory
            </button>
          </form>
        </div>

        {/* Issue Quota */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 ring-2 ring-emerald-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
            <i className="fas fa-hand-holding-box text-xl"></i>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-6">Record Distribution</h3>
          <form onSubmit={handleDistribute} className="space-y-4">
            <input 
              className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-400 outline-none transition-all font-medium"
              placeholder="Scan/Type Family ID" 
              value={distForm.familyId}
              onChange={e => setDistForm({...distForm, familyId: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-3">
              <input 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-400 outline-none transition-all font-medium text-sm"
                placeholder="Center" 
                value={distForm.center}
                onChange={e => setDistForm({...distForm, center: e.target.value})}
              />
              <input 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-400 outline-none transition-all font-medium text-sm"
                placeholder="Item" 
                value={distForm.item}
                onChange={e => setDistForm({...distForm, item: e.target.value})}
              />
            </div>
            <input 
              type="number"
              className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-400 outline-none transition-all font-medium"
              placeholder="Quantity to Issue" 
              value={distForm.quantity || ''}
              onChange={e => setDistForm({...distForm, quantity: Number(e.target.value)})}
            />
            <button   type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-200 transform active:scale-[0.98]">
              Finalize Transfer
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Transaction History */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Audit Trail</h3>
              <p className="text-xs text-slate-500 font-bold">Latest distribution events</p>
            </div>
            <button 
                onClick={() => setTransactions([])} 
                className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
            >
                Clear History
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-4">Timestamp</th>
                  <th className="px-8 py-4">Beneficiary</th>
                  <th className="px-8 py-4">Commodity</th>
                  <th className="px-8 py-4 text-right">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">No activity logged in the current session.</td></tr>
                ) : (
                  transactions.slice(0, 10).map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-medium text-slate-500">
                        {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-black text-slate-800">{log.familyId}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{log.itemName}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{log.centerName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-black">
                          {log.quantity}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
