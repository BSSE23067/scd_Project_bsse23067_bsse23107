
import React from 'react';
import { PortalType } from '../types';

interface NavbarProps {
  activePortal: PortalType;
  onPortalChange: (portal: PortalType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePortal, onPortalChange }) => {
  return (
    <nav className="bg-slate-900 text-white shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="bg-blue-600 p-2.5 rounded-xl group-hover:bg-blue-500 transition-colors">
              <i className="fas fa-box-heart text-2xl text-white"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight leading-none">ReliefTrack</span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Unified Portal</span>
            </div>
          </div>
          
          <div className="flex bg-slate-800 rounded-2xl p-1.5 border border-slate-700">
            <button 
              onClick={() => onPortalChange('seeker')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activePortal === 'seeker' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <i className="fas fa-hand-holding-heart"></i>
              Seeker
            </button>
            <button 
              onClick={() => onPortalChange('staff')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activePortal === 'staff' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <i className="fas fa-shield-halved"></i>
              Staff
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
