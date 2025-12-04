import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import Dashboard from './components/Dashboard';
import AddExpenseForm from './components/AddExpenseForm';
import ExpenseList from './components/ExpenseList';
import BudgetPlanner from './components/BudgetPlanner';
import Reports from './components/Reports';
import SplitBill from './components/SplitBill';
import ChatBot from './components/ChatBot';
import { LayoutDashboard, Receipt, PiggyBank, BarChart3, Users, Menu, X, MessageSquareText, Wallet } from 'lucide-react';

type View = 'dashboard' | 'expenses' | 'budget' | 'reports' | 'split' | 'chat';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          setCurrentView(view);
          setMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
          isActive 
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="relative z-10">{label}</span>
        {isActive && <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-100 -z-0"></div>}
      </button>
    );
  };

  const renderContent = () => {
    // Wrap content in a fade-in div for smooth transitions
    const ContentWrapper = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
      <div className={`animate-fade-in ${className} h-full`}>
        {children}
      </div>
    );

    switch (currentView) {
      case 'dashboard': return <ContentWrapper><Dashboard /></ContentWrapper>;
      case 'expenses': return (
        <ContentWrapper className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-4 md:p-8">
          <div className="lg:col-span-1 space-y-6">
            <AddExpenseForm />
          </div>
          <div className="lg:col-span-2">
            <ExpenseList />
          </div>
        </ContentWrapper>
      );
      case 'budget': return <ContentWrapper className="p-4 md:p-8 max-w-7xl mx-auto"><BudgetPlanner /></ContentWrapper>;
      case 'reports': return <ContentWrapper className="p-4 md:p-8 max-w-7xl mx-auto"><Reports /></ContentWrapper>;
      case 'split': return <ContentWrapper className="p-4 md:p-8 max-w-7xl mx-auto"><SplitBill /></ContentWrapper>;
      case 'chat': return <ContentWrapper className="p-4 md:p-8 h-full w-full max-w-6xl mx-auto"><ChatBot /></ContentWrapper>;
      default: return <ContentWrapper><Dashboard /></ContentWrapper>;
    }
  };

  return (
    <FinanceProvider>
      <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex flex-col w-72 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 shadow-xl z-20">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-emerald-500 rounded-xl p-2 shadow-lg shadow-emerald-500/20">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">SpendSmart</h1>
                <p className="text-xs text-slate-400 font-medium">Finance Tracker</p>
              </div>
            </div>
            
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</div>
            <nav className="space-y-2">
              <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem view="expenses" icon={Receipt} label="Transactions" />
              <NavItem view="budget" icon={PiggyBank} label="Budgets" />
              <NavItem view="reports" icon={BarChart3} label="Analytics" />
              <NavItem view="split" icon={Users} label="Split Bill" />
            </nav>
            
            <div className="mt-8 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">AI Tools</div>
            <nav className="space-y-2">
               <NavItem view="chat" icon={MessageSquareText} label="Smart Assistant" />
            </nav>
          </div>
          
          <div className="mt-auto p-6 border-t border-slate-800">
             <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-xs text-slate-400 leading-relaxed">
                  "Beware of little expenses. A small leak will sink a great ship."
                </p>
             </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 rounded-lg p-1.5">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">SpendSmart</span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 active:bg-slate-100 rounded-lg transition-colors"
            >
                {mobileMenuOpen ? <X className="w-6 h-6 text-slate-600" /> : <Menu className="w-6 h-6 text-slate-600" />}
            </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 bg-slate-900 z-40 pt-20 px-4 md:hidden animate-fade-in">
                <nav className="space-y-2">
                    <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem view="expenses" icon={Receipt} label="Transactions" />
                    <NavItem view="budget" icon={PiggyBank} label="Budgets" />
                    <NavItem view="reports" icon={BarChart3} label="Analytics" />
                    <NavItem view="split" icon={Users} label="Split Bill" />
                    <NavItem view="chat" icon={MessageSquareText} label="AI Assistant" />
                </nav>
            </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto h-screen w-full relative pt-16 md:pt-0 scroll-smooth">
          {renderContent()}
        </main>
      </div>
    </FinanceProvider>
  );
};

export default App;