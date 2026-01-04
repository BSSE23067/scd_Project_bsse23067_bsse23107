import React, { useEffect, useState } from "react";
import { SeekerPortal } from "./components/SeekerPortal";
import { StaffPortal } from "./components/StaffPortal";
import { Navbar } from "./components/Navbar";
import { PortalType, Family, InventoryItem, Transaction } from "./types";
import API_BASE_URL from "./config/api";

const App: React.FC = () => {
  const [activePortal, setActivePortal] = useState<PortalType>("seeker");
  const [families, setFamilies] = useState<Family[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load data from backend on app start
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/families`)
      .then(res => res.json())
      .then(data => {
        // Map snake_case to camelCase
        const mapped = data.map((item: any) => ({
          familyId: item.family_id || item.familyId,
          name: item.name,
          rationBalance: item.ration_balance || item.rationBalance
        }));
        setFamilies(mapped);
      });

    fetch(`${API_BASE_URL}/api/inventory`)
      .then(res => res.json())
      .then(data => {
        // Map snake_case to camelCase
        const mapped = data.map((item: any) => ({
          id: item.id,
          centerName: item.center_name || item.centerName,
          itemName: item.item_name || item.itemName,
          quantity: item.quantity
        }));
        setInventory(mapped);
      });

    fetch(`${API_BASE_URL}/api/transactions`)
      .then(res => res.json())
      .then(data => {
        // Map snake_case to camelCase
        const mapped = data.map((item: any) => ({
          id: item.id,
          familyId: item.family_id || item.familyId,
          itemName: item.item_name || item.itemName,
          centerName: item.center_name || item.centerName,
          quantity: item.quantity,
          date: item.created_at || item.date
        }));
        setTransactions(mapped);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar activePortal={activePortal} onPortalChange={setActivePortal} />

      <main className="flex-grow container mx-auto px-4 py-8">
        {activePortal === "seeker" ? (
          <SeekerPortal families={families} inventory={inventory} />
        ) : (
          <StaffPortal
            families={families}
            inventory={inventory}
            transactions={transactions}
            setFamilies={setFamilies}
            setInventory={setInventory}
            setTransactions={setTransactions}
          />
        )}
      </main>
    </div>
  );
};

export default App;
