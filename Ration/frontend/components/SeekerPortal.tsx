
import React, { useState, useEffect } from 'react';
import { Family, InventoryItem } from '../types';
import API_BASE_URL from '../config/api';

interface SeekerPortalProps {
  families: Family[];
  inventory: InventoryItem[];
}

export const SeekerPortal: React.FC<SeekerPortalProps> = ({ families, inventory: initialInventory }) => {
  const [searchId, setSearchId] = useState('');
  const [foundFamily, setFoundFamily] = useState<Family | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  // Fetch latest inventory data from database
  const fetchInventory = async () => {
    setInventoryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory`);
      if (response.ok) {
        const data = await response.json();
        // Map snake_case to camelCase and ensure we have actual database values
        const mapped = data.map((item: any, index: number) => ({
          id: item.id || `${item.center_name || item.centerName}-${item.item_name || item.itemName}-${index}`,
          centerName: item.center_name || item.centerName,
          itemName: item.item_name || item.itemName,
          quantity: Number(item.quantity) || 0 // Ensure quantity is a number from database
        }));
        setInventory(mapped);
        console.log('Inventory updated from database:', mapped); // Debug log
      } else {
        console.error('Failed to fetch inventory:', response.statusText);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setInventoryLoading(false);
    }
  };

  // Load inventory on mount and refresh periodically
  useEffect(() => {
    // Always fetch fresh data from API on mount, regardless of initialInventory prop
    fetchInventory();
    
    // Refresh inventory every 10 seconds to show real-time updates
    const interval = setInterval(fetchInventory, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Also update inventory when the prop changes (in case App.tsx updates it)
  useEffect(() => {
    if (initialInventory && initialInventory.length > 0) {
      setInventory(initialInventory);
    }
  }, [initialInventory]);

  // Also refresh inventory when user searches for a family
  const handleCheckBalance = async () => {
    if (!searchId.trim()) {
      setError('Please enter a Family ID');
      return;
    }

    setLoading(true);
    setError('');
    setFoundFamily(null);

    try {
      // Fetch latest inventory before showing family details
      await fetchInventory();
      
      const response = await fetch(`${API_BASE_URL}/api/families/${searchId.toUpperCase()}`);
      
      if (response.ok) {
        const data = await response.json();
        // Map snake_case to camelCase
        const mappedFamily: Family = {
          familyId: data.family_id || data.familyId,
          name: data.name,
          rationBalance: data.ration_balance || data.rationBalance
        };
        setFoundFamily(mappedFamily);
      } else if (response.status === 404) {
        setError('Family ID not found. Please contact the nearest center for registration.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <header className="text-center space-y-4">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
          Public Access
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Assistance Portal</h1>
        <p className="text-slate-500 max-w-lg mx-auto">Check your entitlements and view real-time food stock availability in your district.</p>
      </header>

      {/* Balance Check Card */}
      <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-10">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <i className="fas fa-search-dollar"></i>
            </div>
            Check Ration Balance
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <i className="fas fa-fingerprint absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Enter Family ID (e.g. FAM001)" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg font-medium"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckBalance()}
              />
            </div>
            <button 
              onClick={handleCheckBalance}
              disabled={loading}
              className="px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Searching...
                </>
              ) : (
                <>
                  Verify Identity
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-5 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
              <i className="fas fa-exclamation-triangle mt-1"></i>
              <div>
                <p className="font-bold">Access Denied</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          )}

          {foundFamily && (
            <div className="mt-8 p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white animate-in zoom-in-95 duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <i className="fas fa-box-heart text-9xl"></i>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center relative z-10 gap-6">
                <div>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Beneficiary</p>
                  <h3 className="text-3xl font-black">{foundFamily.name}</h3>
                  <div className="mt-4 flex gap-2">
                    <span className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold">{foundFamily.familyId}</span>
                    <span className="px-3 py-1 bg-green-400/30 text-green-100 rounded-lg text-xs font-bold">Status: Active</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Quota Remaining</p>
                  <div className="flex items-baseline justify-end gap-2">
                    <span className="text-6xl font-black tracking-tighter">{foundFamily.rationBalance}</span>
                    <span className="text-xl font-bold text-blue-200">units</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stock Levels Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <i className="fas fa-chart-simple"></i>
             </div>
             <h2 className="text-xl font-bold text-slate-800">Supply Chain Status</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchInventory}
              disabled={inventoryLoading}
              className="text-[10px] font-black bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Refresh inventory"
            >
              {inventoryLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-sync-alt"></i>
                  Refresh
                </>
              )}
            </button>
            <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Live</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {inventory.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400">
              <i className="fas fa-box-open text-4xl mb-4"></i>
              <p className="font-bold">No inventory data available</p>
              <p className="text-sm mt-2">Inventory will appear here once items are added to the system.</p>
            </div>
          ) : (
            inventory.map((item) => {
              const isLow = item.quantity < 50;
              // Ensure quantity is displayed as a number from the database
              const displayQuantity = Number(item.quantity) || 0;
              return (
                <div 
                  key={item.id}
                  className={`group relative p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                    isLow ? 'bg-orange-50 border-orange-100 shadow-orange-100' : 'bg-white border-slate-100 shadow-slate-200/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                      isLow ? 'bg-orange-200 text-orange-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.centerName}
                    </span>
                    {isLow && (
                      <div className="flex items-center text-orange-600 text-xs font-black gap-1">
                        <i className="fas fa-truck-fast animate-bounce"></i>
                        RESTOCKING
                      </div>
                    )}
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">{item.itemName}</h4>
                  <div className="mt-4 flex items-baseline gap-2">
                    <p className={`text-4xl font-black ${isLow ? 'text-orange-600' : 'text-slate-800'}`}>
                      {displayQuantity}
                    </p>
                    <span className="text-sm font-bold text-slate-400">Total Units</span>
                  </div>
                  
                  <div className="mt-6 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                     <div 
                      className={`h-full transition-all duration-1000 ${isLow ? 'bg-orange-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(100, (displayQuantity / 500) * 100)}%` }}
                     ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
