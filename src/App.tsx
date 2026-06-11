import { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Inspection from './pages/Inspection';
import Issues from './pages/Issues';
import Review from './pages/Review';
import Statistics from './pages/Statistics';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'inspection':
        return <Inspection onNavigate={handleNavigate} />;
      case 'issues':
        return <Issues />;
      case 'review':
        return <Review />;
      case 'statistics':
        return <Statistics />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="ml-64 p-8">
        {renderPage()}
      </main>
    </div>
  );
}
