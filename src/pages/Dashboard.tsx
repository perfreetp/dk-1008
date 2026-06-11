import { useState } from 'react';
import { useAppStore } from '../store';
import { Batch, STATUS_MAP, ISSUE_TYPE_MAP } from '../types';
import { ArrowRight, CheckCircle, AlertTriangle, Clock, TrendingUp, Map, Percent, Eye, X, BarChart3 } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const batches = useAppStore(state => state.batches);
  const issues = useAppStore(state => state.issues);
  const materials = useAppStore(state => state.materials);
  const setSelectedBatchId = useAppStore(state => state.setSelectedBatchId);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

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

  const handleViewDetail = (batch: Batch, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBatch(batch);
  };

  const getBatchIssues = (batchId: string) => issues.filter(i => i.batch_id === batchId);
  const getBatchMaterials = (batchId: string) => materials.filter(m => m.batch_id === batchId);

  const getIssueTypeDistribution = (batchId: string) => {
    const batchIssues = getBatchIssues(batchId);
    const distribution: Record<string, number> = {};
    batchIssues.forEach(issue => {
      distribution[issue.type] = (distribution[issue.type] || 0) + 1;
    });
    return distribution;
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
                    <button
                      onClick={(e) => handleViewDetail(batch, e)}
                      className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">详情</span>
                    </button>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedBatch.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBatch.status)}`}>
                      {STATUS_MAP[selectedBatch.status]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBatch(null)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">道路名称</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{selectedBatch.road_name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">道路类型</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{selectedBatch.road_type}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">采集团队</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{selectedBatch.team_name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">创建时间</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {new Date(selectedBatch.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">素材统计</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">总素材数</span>
                      <span className="font-semibold text-gray-800">{selectedBatch.material_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">已抽检数</span>
                      <span className="font-semibold text-primary-600">{selectedBatch.inspected_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">抽检率</span>
                      <span className="font-semibold text-success-600">
                        {selectedBatch.material_count > 0 
                          ? ((selectedBatch.inspected_count / selectedBatch.material_count) * 100).toFixed(1) 
                          : '0.0'}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-danger-500" />
                    <span className="text-sm font-medium text-gray-700">问题统计</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">问题总数</span>
                      <span className="font-semibold text-danger-600">{selectedBatch.issue_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">异常占比</span>
                      <span className="font-semibold text-warning-600">
                        {selectedBatch.material_count > 0 
                          ? ((selectedBatch.issue_count / selectedBatch.material_count) * 100).toFixed(1) 
                          : '0.0'}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">合格率</span>
                      <span className="font-semibold text-success-600">
                        {selectedBatch.material_count > 0 
                          ? ((selectedBatch.material_count - selectedBatch.issue_count) / selectedBatch.material_count * 100).toFixed(1) 
                          : '100.0'}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Map className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">路线覆盖</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">覆盖道路</span>
                      <span className="font-semibold text-gray-800">1条</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">道路名称</span>
                      <span className="font-semibold text-blue-600">{selectedBatch.road_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">道路类型</span>
                      <span className="font-semibold text-gray-800">{selectedBatch.road_type}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-4">问题类型分布</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(getIssueTypeDistribution(selectedBatch.id)).map(([type, count]) => (
                    <div key={type} className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-primary-600">{count}</div>
                      <div className="text-sm text-gray-600 mt-1">{ISSUE_TYPE_MAP[type as keyof typeof ISSUE_TYPE_MAP]}</div>
                    </div>
                  ))}
                  {Object.keys(getIssueTypeDistribution(selectedBatch.id)).length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <CheckCircle className="w-12 h-12 text-success-400 mx-auto mb-2" />
                      <p className="text-gray-500">暂无问题记录</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-4">问题列表</h4>
                <div className="space-y-3">
                  {getBatchIssues(selectedBatch.id).map(issue => (
                    <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            issue.type === 'blur' ? 'bg-purple-100 text-purple-600' :
                            issue.type === 'occlusion' ? 'bg-orange-100 text-orange-600' :
                            issue.type === 'duplicate' ? 'bg-blue-100 text-blue-600' :
                            issue.type === 'mileage_error' ? 'bg-red-100 text-red-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {ISSUE_TYPE_MAP[issue.type]}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            issue.status === 'pending' ? 'bg-gray-100 text-gray-600' :
                            issue.status === 'reviewing' ? 'bg-primary-100 text-primary-600' :
                            issue.status === 'resolved' ? 'bg-success-100 text-success-600' :
                            'bg-danger-100 text-danger-600'
                          }`}>
                            {STATUS_MAP[issue.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(issue.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  ))}
                  {getBatchIssues(selectedBatch.id).length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-success-400 mx-auto mb-2" />
                      <p className="text-gray-500">暂无问题记录</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setSelectedBatch(null)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
