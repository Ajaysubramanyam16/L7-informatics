import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import Dashboard from './components/Dashboard';
import AddExpenseForm from './components/AddExpenseForm';
import ExpenseList from './components/ExpenseList';
import BudgetPlanner from './components/BudgetPlanner';
import Reports from './components/Reports';
import SplitBill from './components/SplitBill';
import { LayoutDashboard, Receipt, PiggyBank, BarChart3, Users, Menu, X } from 'lucide-react';

type View = 'dashboard' | 'expenses' | 'budget' | 'reports' | 'split';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        currentView === view 
          ? 'bg-emerald-50 text-emerald-700' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'expenses': return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-6">
          <div className="lg:col-span-1">
            <AddExpenseForm />
          </div>
          <div className="lg:col-span-2">
            <ExpenseList />
          </div>
        </div>
      );
      case 'budget': return <div className="p-6 max-w-7xl mx-auto"><BudgetPlanner /></div>;
      case 'reports': return <div className="p-6 max-w-7xl mx-auto"><Reports /></div>;
      case 'split': return <div className="p-6 max-w-7xl mx-auto"><SplitBill /></div>;
      default: return <Dashboard />;
    }
  };

  return (
    <FinanceProvider>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 rounded-lg p-1.5">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">SpendSmart</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="expenses" icon={Receipt} label="Expenses" />
            <NavItem view="budget" icon={PiggyBank} label="Budgets" />
            <NavItem view="reports" icon={BarChart3} label="Reports" />
            <NavItem view="split" icon={Users} label="Split Bill" />
          </nav>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-50 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 rounded-lg p-1.5">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">SpendSmart</span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6 text-slate-600" /> : <Menu className="w-6 h-6 text-slate-600" />}
            </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 bg-white z-40 pt-16 px-4 md:hidden">
                <nav className="space-y-2">
                    <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem view="expenses" icon={Receipt} label="Expenses" />
                    <NavItem view="budget" icon={PiggyBank} label="Budgets" />
                    <NavItem view="reports" icon={BarChart3} label="Reports" />
                    <NavItem view="split" icon={Users} label="Split Bill" />
                </nav>
            </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto md:h-screen pt-16 md:pt-0">
          {renderContent()}
        </main>
      </div>
    </FinanceProvider>
  );
};

export default App;
