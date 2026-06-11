import { useState } from 'react';
import { useAppStore } from '../store';
import { Material, IssueType, ISSUE_TYPE_MAP } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, MapPin, Clock, Video, Image, Compass } from 'lucide-react';

interface InspectionProps {
  onNavigate: (page: string) => void;
}

export default function Inspection({ onNavigate }: InspectionProps) {
  const selectedBatchId = useAppStore(state => state.selectedBatchId);
  const batches = useAppStore(state => state.batches);
  const materials = useAppStore(state => state.materials);
  const markMaterialPassed = useAppStore(state => state.markMaterialPassed);
  const createIssue = useAppStore(state => state.createIssue);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType>('blur');
  const [issueDescription, setIssueDescription] = useState('');

  const batch = batches.find(b => b.id === selectedBatchId);
  const batchMaterials = materials.filter(m => m.batch_id === selectedBatchId);
  const currentMaterial = batchMaterials[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < batchMaterials.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleMarkPassed = () => {
    if (currentMaterial) {
      markMaterialPassed(currentMaterial.id);
      if (currentIndex < batchMaterials.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const handleReportIssue = () => {
    if (currentMaterial && issueDescription.trim()) {
      createIssue({
        batch_id: batch?.id || '',
        material_id: currentMaterial.id,
        type: selectedIssueType,
        description: issueDescription,
        status: 'pending',
      });
      setShowIssueModal(false);
      setIssueDescription('');
      if (currentIndex < batchMaterials.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-success-100 text-success-600';
      case 'issue': return 'bg-danger-100 text-danger-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!selectedBatchId || !batch) {
    return (
      <div className="animate-fadeIn flex flex-col items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Image className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">请选择批次</h3>
          <p className="text-gray-500 mb-4">从批次看板选择一个批次开始抽检</p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            返回批次看板
          </button>
        </div>
      </div>
    );
  }

  if (!currentMaterial) {
    return (
      <div className="animate-fadeIn flex flex-col items-center justify-center h-[60vh]">
        <p className="text-gray-500">该批次暂无素材</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">抽检</h2>
          <p className="text-gray-500 mt-1">{batch.name} - {batch.road_name}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {batchMaterials.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="relative aspect-video bg-gray-900">
              <img
                src={currentMaterial.url}
                alt="采集素材"
                className="w-full h-full object-contain"
              />
              {currentMaterial.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <Video className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              )}
              
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(currentMaterial.status)}`}>
                  {currentMaterial.status === 'passed' ? '已通过' : currentMaterial.status === 'issue' ? '有问题' : '待检查'}
                </span>
              </div>

              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === batchMaterials.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={handleMarkPassed}
              disabled={currentMaterial.status !== 'pending'}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                currentMaterial.status === 'passed'
                  ? 'bg-success-100 text-success-600 cursor-default'
                  : currentMaterial.status === 'issue'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-success-500 text-white hover:bg-success-600'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>{currentMaterial.status === 'passed' ? '已标记合格' : '标记合格'}</span>
            </button>
            <button
              onClick={() => setShowIssueModal(true)}
              disabled={currentMaterial.status !== 'pending'}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                currentMaterial.status === 'issue'
                  ? 'bg-danger-100 text-danger-600 cursor-default'
                  : currentMaterial.status === 'passed'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-danger-500 text-white hover:bg-danger-600'
              }`}
            >
              <AlertCircle className="w-5 h-5" />
              <span>{currentMaterial.status === 'issue' ? '已报告问题' : '报告问题'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">素材信息</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-sm text-gray-500">定位坐标</p>
                  <p className="font-medium text-gray-800">
                    {currentMaterial.latitude.toFixed(6)}, {currentMaterial.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Compass className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-sm text-gray-500">采集方向</p>
                  <p className="font-medium text-gray-800">{currentMaterial.direction}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-sm text-gray-500">采集时间</p>
                  <p className="font-medium text-gray-800">{formatDate(currentMaterial.captured_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {currentMaterial.type === 'image' ? (
                  <Image className="w-5 h-5 text-primary-500" />
                ) : (
                  <Video className="w-5 h-5 text-primary-500" />
                )}
                <div>
                  <p className="text-sm text-gray-500">素材类型</p>
                  <p className="font-medium text-gray-800">{currentMaterial.type === 'image' ? '图片' : '视频'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">缩略图</h3>
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {batchMaterials.map((material, index) => (
                <div
                  key={material.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentIndex
                      ? 'border-primary-500'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={material.url}
                    alt={`素材 ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  {material.status === 'passed' && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-success-500 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {material.status === 'issue' && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger-500 flex items-center justify-center">
                      <AlertCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">报告问题</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">问题类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(ISSUE_TYPE_MAP) as IssueType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedIssueType(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedIssueType === type
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {ISSUE_TYPE_MAP[type]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">问题描述</label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="请描述问题详情..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowIssueModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReportIssue}
                disabled={!issueDescription.trim()}
                className="px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
