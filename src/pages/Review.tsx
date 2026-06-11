import { useState } from 'react';
import { useAppStore } from '../store';
import { Issue, ISSUE_TYPE_MAP, STATUS_MAP } from '../types';
import { CheckCircle, XCircle, MessageSquare, AlertCircle, Eye } from 'lucide-react';

export default function Review() {
  const issues = useAppStore(state => state.issues);
  const reviewIssue = useAppStore(state => state.reviewIssue);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  const reviewingIssues = issues.filter(i => i.status === 'reviewing');
  const pendingIssues = issues.filter(i => i.status === 'pending');

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
    });
  };

  const handleReview = (result: 'passed' | 'rejected') => {
    if (selectedIssue) {
      reviewIssue(selectedIssue.id, result, reviewComment);
      setSelectedIssue(null);
      setReviewComment('');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">复核</h2>
          <p className="text-gray-500 mt-1">对整改结果进行复核确认</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">待复核</p>
              <p className="text-xl font-bold text-gray-800">{reviewingIssues.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">待处理</p>
              <p className="text-xl font-bold text-gray-800">{pendingIssues.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已完成</p>
              <p className="text-xl font-bold text-gray-800">{issues.filter(i => i.status === 'resolved' || i.status === 'rejected').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">待复核列表</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {reviewingIssues.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-success-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无待复核的问题</p>
            </div>
          ) : (
            reviewingIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
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
                      <span>{formatDate(issue.created_at)}</span>
                    </div>
                  </div>
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">问题复核</h3>
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
                  onClick={() => setSelectedIssue(null)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <span className="text-gray-500">×</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">问题素材</label>
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <img
                      src={selectedIssue.material_url}
                      alt="问题素材"
                      className="w-full h-64 object-contain"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">整改后素材</label>
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <img
                      src={selectedIssue.material_url}
                      alt="整改后素材"
                      className="w-full h-64 object-contain opacity-70"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="text-white text-sm">整改对比图</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">问题描述</label>
                <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">{selectedIssue.description}</p>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">整改说明</label>
                <p className="text-gray-800 bg-success-50 p-4 rounded-lg border border-success-200">
                  已根据问题描述进行整改，重新采集了相关素材，问题已修复。
                </p>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">复核意见</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="请输入复核意见（可选）..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedIssue(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleReview('rejected')}
                className="flex items-center gap-2 px-6 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors"
              >
                <XCircle className="w-5 h-5" />
                <span>退回整改</span>
              </button>
              <button
                onClick={() => handleReview('passed')}
                className="flex items-center gap-2 px-6 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                <span>通过</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
