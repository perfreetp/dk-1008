import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { ISSUE_TYPE_MAP, STATUS_MAP } from '../types';
import { Download, BarChart3, PieChart, TrendingUp, FileText, Filter } from 'lucide-react';

export default function Statistics() {
  const batches = useAppStore(state => state.batches);
  const issues = useAppStore(state => state.issues);

  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');

  const teams = useMemo(() => {
    const teamMap = new Map<string, string>();
    batches.forEach(batch => {
      if (batch.team_id && batch.team_name) {
        teamMap.set(batch.team_id, batch.team_name);
      }
    });
    return Array.from(teamMap.entries()).map(([id, name]) => ({ id, name }));
  }, [batches]);

  const filteredBatches = useMemo(() => {
    return batches.filter(batch => {
      if (selectedBatchId !== 'all' && batch.id !== selectedBatchId) return false;
      if (selectedTeamId !== 'all' && batch.team_id !== selectedTeamId) return false;
      return true;
    });
  }, [batches, selectedBatchId, selectedTeamId]);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const batch = batches.find(b => b.id === issue.batch_id);
      if (!batch) return false;
      if (selectedBatchId !== 'all' && batch.id !== selectedBatchId) return false;
      if (selectedTeamId !== 'all' && batch.team_id !== selectedTeamId) return false;
      return true;
    });
  }, [issues, batches, selectedBatchId, selectedTeamId]);

  const statistics = useMemo(() => {
    const byTeam = filteredBatches.reduce((acc, batch) => {
      const team = acc.find(t => t.team_name === batch.team_name);
      const teamIssues = filteredIssues.filter(i => i.batch_id === batch.id);
      if (team) {
        team.total_batches++;
        team.total_materials += batch.material_count;
        team.issue_count += teamIssues.length;
      } else {
        acc.push({
          team_name: batch.team_name || '',
          total_batches: 1,
          total_materials: batch.material_count,
          issue_count: teamIssues.length,
          pass_rate: batch.material_count > 0
            ? ((batch.material_count - teamIssues.length) / batch.material_count) * 100
            : 0,
        });
      }
      return acc;
    }, [] as { team_name: string; total_batches: number; total_materials: number; issue_count: number; pass_rate: number }[]);

    const byRoadType = filteredBatches.reduce((acc, batch) => {
      const roadType = acc.find(r => r.road_type === batch.road_type);
      const typeIssues = filteredIssues.filter(i => i.batch_id === batch.id);
      if (roadType) {
        roadType.total_batches++;
        roadType.issue_count += typeIssues.length;
      } else {
        acc.push({
          road_type: batch.road_type,
          total_batches: 1,
          issue_count: typeIssues.length,
        });
      }
      return acc;
    }, [] as { road_type: string; total_batches: number; issue_count: number }[]);

    const issueTypeCounts: Record<string, number> = {};
    filteredIssues.forEach(issue => {
      issueTypeCounts[issue.type] = (issueTypeCounts[issue.type] || 0) + 1;
    });
    const totalIssues = filteredIssues.length;
    const byIssueType = Object.entries(issueTypeCounts).map(([type, count]) => ({
      issue_type: type,
      count,
      percentage: totalIssues > 0 ? (count / totalIssues) * 100 : 0,
    }));

    return { byTeam, byRoadType, byIssueType };
  }, [filteredBatches, filteredIssues]);

  const totalBatches = filteredBatches.length;
  const totalMaterials = filteredBatches.reduce((sum, b) => sum + b.material_count, 0);
  const totalIssues = filteredIssues.length;
  const avgIssueRate = totalMaterials > 0 ? (totalIssues / totalMaterials) * 100 : 0;

  const exportQualityList = () => {
    const data = filteredBatches.map(batch => ({
      批次名称: batch.name,
      道路类型: batch.road_type,
      采集团队: batch.team_name,
      道路名称: batch.road_name,
      素材总数: batch.material_count,
      已抽检数: batch.inspected_count,
      问题数: batch.issue_count,
      异常占比: batch.material_count > 0 ? ((batch.issue_count / batch.material_count) * 100).toFixed(2) + '%' : '0%',
      状态: STATUS_MAP[batch.status],
      创建时间: new Date(batch.created_at).toLocaleString('zh-CN'),
      更新时间: new Date(batch.updated_at).toLocaleString('zh-CN'),
    }));

    const csv = [Object.keys(data[0]).join(','), ...data.map(row => Object.values(row).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `质检清单_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const exportIssueDetails = () => {
    const data = filteredIssues.map(issue => ({
      问题ID: issue.id,
      批次名称: issue.batch_name,
      道路名称: issue.road_name,
      道路类型: issue.road_type,
      问题类型: ISSUE_TYPE_MAP[issue.type],
      问题描述: issue.description,
      坐标位置: issue.latitude ? `${issue.latitude.toFixed(6)}, ${issue.longitude?.toFixed(6)}` : '',
      采集方向: issue.direction || '',
      状态: STATUS_MAP[issue.status],
      整改说明: issue.rectification_note || '',
      复核意见: issue.review_comment || '',
      创建时间: new Date(issue.created_at).toLocaleString('zh-CN'),
      更新时间: new Date(issue.updated_at).toLocaleString('zh-CN'),
    }));

    const csv = [Object.keys(data[0]).join(','), ...data.map(row => Object.values(row).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `整改明细_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const maxTeamIssue = Math.max(...statistics.byTeam.map(t => t.issue_count), 1);
  const maxRoadIssue = Math.max(...statistics.byRoadType.map(r => r.issue_count), 1);

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">统计分析</h2>
          <p className="text-gray-500 mt-1">按采集团队、道路类型、问题类别汇总数据</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportQualityList}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>导出质检清单</span>
          </button>
          <button
            onClick={exportIssueDetails}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>导出整改明细</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">筛选条件：</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">批次：</span>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">全部批次</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">团队：</span>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">全部团队</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          {(selectedBatchId !== 'all' || selectedTeamId !== 'all') && (
            <button
              onClick={() => {
                setSelectedBatchId('all');
                setSelectedTeamId('all');
              }}
              className="px-4 py-2 text-sm text-primary-600 hover:text-primary-700"
            >
              清除筛选
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总批次</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalBatches}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-600" />
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
              <FileText className="w-6 h-6 text-success-600" />
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
              <PieChart className="w-6 h-6 text-danger-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">平均问题率</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{avgIssueRate.toFixed(2)}%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">按采集团队统计</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {statistics.byTeam.map((team) => (
                <div key={team.team_name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{team.team_name}</span>
                    <span className="text-sm text-gray-500">{team.issue_count} 个问题</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${(team.issue_count / maxTeamIssue) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>批次: {team.total_batches}</span>
                    <span>素材: {team.total_materials}</span>
                    <span>通过率: {team.pass_rate.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
              {statistics.byTeam.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无数据</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">按道路类型统计</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {statistics.byRoadType.map((road) => (
                <div key={road.road_type}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{road.road_type}</span>
                    <span className="text-sm text-gray-500">{road.issue_count} 个问题</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success-500 rounded-full transition-all duration-500"
                      style={{ width: `${(road.issue_count / maxRoadIssue) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>批次: {road.total_batches}</span>
                  </div>
                </div>
              ))}
              {statistics.byRoadType.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无数据</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">按问题类别统计</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {statistics.byIssueType.map((issue) => (
                <div
                  key={issue.issue_type}
                  className="bg-gray-50 rounded-lg p-4 text-center"
                >
                  <div className="text-3xl font-bold text-primary-600">{issue.count}</div>
                  <div className="text-sm text-gray-600 mt-1">{ISSUE_TYPE_MAP[issue.issue_type as keyof typeof ISSUE_TYPE_MAP]}</div>
                  <div className="text-xs text-gray-400 mt-1">{issue.percentage.toFixed(1)}%</div>
                </div>
              ))}
              {statistics.byIssueType.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">暂无数据</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
