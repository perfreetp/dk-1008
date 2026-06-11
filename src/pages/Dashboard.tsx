import { useAppStore } from '../store';
import { STATUS_MAP } from '../types';
import { ArrowRight, CheckCircle, AlertTriangle, Clock, TrendingUp, Map, Percent } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const batches = useAppStore(state => state.batches);
  const setSelectedBatchId = useAppStore(state => state.setSelectedBatchId);
  
  const totalBatches = batches.length;
  const completedBatches = batches.filter(b => b.status === 'completed').length;
  const inProgressBatches = batches.filter(b => b.status === 'inspecting' || b.status === 'reviewing').length;
  const pendingBatches = batches.filter(b => b.status === 'pending').length;
  const totalMaterials = batches.reduce((sum, b) => sum + b.material_count, 0);
  const totalIssues = batches.reduce((sum, b) => sum + b.issue_count, 0);
  const avgIssueRate = totalMaterials > 0 ? ((totalIssues / totalMaterials) * 100).toFixed(1) : '0.0';
  
  const uniqueRoads = new Set(batches.map(b => b.road_name)).size;
  const uniqueRoadTypes = new Set(batches.map(b => b.road_type)).size;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success-100 text-success-600';
      case 'inspecting': return 'bg-warning-100 text-warning-600';
      case 'reviewing': return 'bg-primary-100 text-primary-600';
      case 'pending': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed': return 'border-success-200 bg-success-50';
      case 'inspecting': return 'border-warning-200 bg-warning-50';
      case 'reviewing': return 'border-primary-200 bg-primary-50';
      case 'pending': return 'border-gray-200 bg-gray-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const handleBatchClick = (batchId: string) => {
    setSelectedBatchId(batchId);
    onNavigate('inspection');
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">批次看板</h2>
          <p className="text-gray-500 mt-1">实时监控道路采集数据质检进度</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总批次</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalBatches}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总素材数</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalMaterials}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">进行中</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{inProgressBatches}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">问题总数</p>
              <p className="text-3xl font-bold text-danger-600 mt-2">{totalIssues}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-danger-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">路线覆盖</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{uniqueRoads}条</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Map className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <span>{uniqueRoadTypes}种道路类型</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">异常占比</p>
              <p className="text-3xl font-bold text-warning-600 mt-2">{avgIssueRate}%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Percent className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-success-500 to-danger-500 rounded-full" 
                style={{ width: `${parseFloat(avgIssueRate)}%` }} 
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>合格率</span>
              <span>异常率</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">批次列表</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {batches.map((batch) => {
            const issueRate = batch.material_count > 0 
              ? ((batch.issue_count / batch.material_count) * 100).toFixed(1) 
              : '0.0';
            const passRate = (100 - parseFloat(issueRate)).toFixed(1);
            
            return (
              <div
                key={batch.id}
                onClick={() => handleBatchClick(batch.id)}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${getStatusBg(batch.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-800">{batch.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                        {STATUS_MAP[batch.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{batch.team_name}</span>
                      <span>{batch.road_name}</span>
                      <span>{batch.road_type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">抽检进度</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500 rounded-full" 
                            style={{ width: `${(batch.inspected_count / batch.material_count) * 100}%` }} 
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {batch.inspected_count}/{batch.material_count}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">问题数量</p>
                      <p className={`text-lg font-semibold mt-1 ${batch.issue_count > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                        {batch.issue_count}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">异常占比</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-danger-500 rounded-full" 
                            style={{ width: `${parseFloat(issueRate)}%` }} 
                          />
                        </div>
                        <span className={`text-sm font-medium ${parseFloat(issueRate) > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                          {issueRate}%
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
