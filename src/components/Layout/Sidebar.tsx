import { LayoutDashboard, Search, AlertCircle, CheckSquare, BarChart3 } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: '批次看板', icon: LayoutDashboard },
  { id: 'inspection', label: '抽检', icon: Search },
  { id: 'issues', label: '问题登记', icon: AlertCircle },
  { id: 'review', label: '复核', icon: CheckSquare },
  { id: 'statistics', label: '统计', icon: BarChart3 },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">公路数据质检</h1>
        <p className="text-sm text-gray-500 mt-1">道路采集成果检查系统</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 text-sm font-medium">D</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">数据运营员</p>
            <p className="text-xs text-gray-500">在线</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
