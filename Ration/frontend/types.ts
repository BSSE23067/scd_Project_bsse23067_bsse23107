
export interface Family {
  familyId: string;
  name: string;
  rationBalance: number;
}

export interface InventoryItem {
  id: string;
  centerName: string;
  itemName: string;
  quantity: number;
}

export interface Transaction {
  id: string;
  familyId: string;
  itemName: string;
  centerName: string;
  quantity: number;
  date: string;
}

export type PortalType = 'seeker' | 'staff';
