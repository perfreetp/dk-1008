import { useState } from 'react';
import { useAppStore } from '../store';
import { Issue, ISSUE_TYPE_MAP, STATUS_MAP, FlowRecord } from '../types';
import { Search, Filter, AlertCircle, Clock, CheckCircle, XCircle, Eye, Send, MapPin, Navigation, ChevronRight, FileText, User, Calendar, ArrowRightCircle } from 'lucide-react';

const ACTION_MAP: Record<FlowRecord['action'], string> = {
  registered: '问题登记',
  rectification_submitted: '提交整改',
  review_passed: '复核通过',
  review_rejected: '复核退回',
};

const getActionColor = (action: FlowRecord['action']) => {
  switch (action) {
    case 'registered': return 'bg-blue-100 text-blue-600 border-blue-200';
    case 'rectification_submitted': return 'bg-green-100 text-green-600 border-green-200';
    case 'review_passed': return 'bg-success-100 text-success-600 border-success-200';
    case 'review_rejected': return 'bg-danger-100 text-danger-600 border-danger-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getActionIcon = (action: FlowRecord['action']) => {
  switch (action) {
    case 'registered': return <FileText className="w-4 h-4" />;
    case 'rectification_submitted': return <Send className="w-4 h-4" />;
    case 'review_passed': return <CheckCircle className="w-4 h-4" />;
    case 'review_rejected': return <XCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

export default function Issues() {
  const issues = useAppStore(state => state.issues);
  const submitRectification = useAppStore(state => state.submitRectification);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [issueTypeFilter, setIssueTypeFilter] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [rectificationNote, setRectificationNote] = useState('');
  const [showRectificationForm, setShowRectificationForm] = useState(false);

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.batch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.road_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesType = issueTypeFilter === 'all' || issue.type === issueTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-600';
      case 'reviewing': return 'bg-primary-100 text-primary-600';
      case 'resolved': return 'bg-success-100 text-success-600';
      case 'rejected': return 'bg-danger-100 text-danger-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case 'blur': return 'bg-purple-100 text-purple-600';
      case 'occlusion': return 'bg-orange-100 text-orange-600';
      case 'duplicate': return 'bg-blue-100 text-blue-600';
      case 'mileage_error': return 'bg-red-100 text-red-600';
      case 'tag_deviation': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmitRectification = () => {
    if (selectedIssue && rectificationNote.trim()) {
      submitRectification(selectedIssue.id, rectificationNote);
      setShowRectificationForm(false);
      setRectificationNote('');
      
      const updatedIssue = issues.find(i => i.id === selectedIssue.id);
      if (updatedIssue) {
        setSelectedIssue({
          ...updatedIssue,
          status: 'reviewing',
          rectification_note: rectificationNote,
          flow_records: [
            ...(updatedIssue.flow_records || []),
            {
              id: Date.now().toString(),
              action: 'rectification_submitted',
              operator: '当前用户',
              comment: rectificationNote,
              created_at: new Date().toISOString(),
            },
          ],
        });
      } else {
        setSelectedIssue(null);
      }
    }
  };

  const pendingCount = issues.filter(i => i.status === 'pending').length;
  const reviewingCount = issues.filter(i => i.status === 'reviewing').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const rejectedCount = issues.filter(i => i.status === 'rejected').length;

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">问题登记</h2>
          <p className="text-gray-500 mt-1">管理和追踪所有质检发现的问题</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">待处理</p>
              <p className="text-xl font-bold text-gray-800">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">复核中</p>
              <p className="text-xl font-bold text-gray-800">{reviewingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已解决</p>
              <p className="text-xl font-bold text-gray-800">{resolvedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已退回</p>
              <p className="text-xl font-bold text-gray-800">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索问题描述、批次名称或道路名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">全部状态</option>
                <option value="pending">待处理</option>
                <option value="reviewing">复核中</option>
                <option value="resolved">已解决</option>
                <option value="rejected">已退回</option>
              </select>
              <select
                value={issueTypeFilter}
                onChange={(e) => setIssueTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">全部类型</option>
                {Object.entries(ISSUE_TYPE_MAP).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredIssues.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无问题记录</p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => {
                  setSelectedIssue(issue);
                  setShowRectificationForm(false);
                  setRectificationNote('');
                }}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIssueTypeColor(issue.type)}`}>
                        {ISSUE_TYPE_MAP[issue.type]}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {STATUS_MAP[issue.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-800 font-medium">{issue.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{issue.batch_name}</span>
                      <span>{issue.road_name}</span>
                      <span>{formatDate(issue.created_at)}</span>
                    </div>
                  </div>
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
                {issue.flow_records && issue.flow_records.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <ArrowRightCircle className="w-4 h-4" />
                      <span>{issue.flow_records.length} 条流转记录</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">问题详情</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIssueTypeColor(selectedIssue.type)}`}>
                      {ISSUE_TYPE_MAP[selectedIssue.type]}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedIssue.status)}`}>
                      {STATUS_MAP[selectedIssue.status]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedIssue(null);
                    setShowRectificationForm(false);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <span className="text-gray-500">×</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">问题描述</label>
                <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">{selectedIssue.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="block text-xs text-gray-500 mb-1">所属批次</label>
                  <p className="text-sm font-medium text-gray-800">{selectedIssue.batch_name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="block text-xs text-gray-500 mb-1">道路名称</label>
                  <p className="text-sm font-medium text-gray-800">{selectedIssue.road_name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="block text-xs text-gray-500 mb-1">道路类型</label>
                  <p className="text-sm font-medium text-gray-800">{selectedIssue.road_type}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="block text-xs text-gray-500 mb-1">采集方向</label>
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {selectedIssue.direction}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">坐标位置</label>
                <p className="text-gray-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {selectedIssue.latitude?.toFixed(6)}, {selectedIssue.longitude?.toFixed(6)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">素材预览</label>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <img
                    src={selectedIssue.material_url}
                    alt="问题素材"
                    className="w-full h-64 object-contain"
                  />
                </div>
              </div>
              
              {selectedIssue.flow_records && selectedIssue.flow_records.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    整改流转时间线
                  </h4>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                    <div className="space-y-4">
                      {[...selectedIssue.flow_records].reverse().map((record, index) => (
                        <div key={record.id} className="relative pl-10">
                          <div className={`absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${getActionColor(record.action)}`}>
                            {getActionIcon(record.action)}
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${
                                record.action === 'registered' ? 'text-blue-600' :
                                record.action === 'rectification_submitted' ? 'text-green-600' :
                                record.action === 'review_passed' ? 'text-success-600' :
                                'text-danger-600'
                              }`}>
                                {ACTION_MAP[record.action]}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Calendar className="w-3 h-3" />
                                {formatDate(record.created_at)}
                              </div>
                            </div>
                            {record.operator && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                <User className="w-3 h-3" />
                                {record.operator}
                              </div>
                            )}
                            {record.comment && (
                              <p className="mt-2 text-sm text-gray-700">{record.comment}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {(selectedIssue.status === 'pending' || selectedIssue.status === 'rejected') && !showRectificationForm && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRectificationForm(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {selectedIssue.status === 'rejected' ? '再次提交整改' : '提交整改说明'}
                </button>
              )}
              
              {showRectificationForm && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">整改说明</label>
                  <textarea
                    value={rectificationNote}
                    onChange={(e) => setRectificationNote(e.target.value)}
                    placeholder="请输入整改说明，描述如何处理此问题..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => setShowRectificationForm(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSubmitRectification}
                      disabled={!rectificationNote.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      提交整改
                    </button>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">创建时间</label>
                  <p className="text-gray-800">{formatDate(selectedIssue.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">更新时间</label>
                  <p className="text-gray-800">{formatDate(selectedIssue.updated_at)}</p>
                </div>
              </div>
            </div>
            {!showRectificationForm && (
              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    setSelectedIssue(null);
                    setShowRectificationForm(false);
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  关闭
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
