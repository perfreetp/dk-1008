import { create } from 'zustand';
import { Batch, Material, Issue, Statistics } from '../types';
import { mockBatches, mockMaterials, mockIssues } from '../data/mockData';

interface AppState {
  batches: Batch[];
  materials: Material[];
  issues: Issue[];
  currentBatch: Batch | null;
  currentMaterial: Material | null;
  selectedBatchId: string | null;
  statistics: Statistics;

  setSelectedBatchId: (id: string | null) => void;
  selectMaterial: (material: Material | null) => void;
  markMaterialPassed: (materialId: string) => void;
  createIssue: (issue: Omit<Issue, 'id' | 'created_at' | 'updated_at'>) => void;
  updateIssueStatus: (issueId: string, status: Issue['status']) => void;
  reviewIssue: (issueId: string, result: 'passed' | 'rejected', comment: string) => void;
  calculateStatistics: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  batches: mockBatches,
  materials: mockMaterials,
  issues: mockIssues,
  currentBatch: null,
  currentMaterial: null,
  selectedBatchId: null,
  statistics: {
    byTeam: [],
    byRoadType: [],
    byIssueType: [],
  },

  setSelectedBatchId: (id) => {
    set({ selectedBatchId: id });
    if (id) {
      const batch = get().batches.find(b => b.id === id);
      set({ currentBatch: batch || null });
    } else {
      set({ currentBatch: null });
    }
  },

  selectMaterial: (material) => {
    set({ currentMaterial: material });
  },

  markMaterialPassed: (materialId) => {
    set(state => ({
      materials: state.materials.map(m =>
        m.id === materialId ? { ...m, status: 'passed' } : m
      ),
    }));
    const batchId = get().materials.find(m => m.id === materialId)?.batch_id;
    if (batchId) {
      set(state => ({
        batches: state.batches.map(b =>
          b.id === batchId ? { ...b, inspected_count: b.inspected_count + 1 } : b
        ),
      }));
    }
  },

  createIssue: (issue) => {
    const newIssue: Issue = {
      ...issue,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set(state => ({ issues: [...state.issues, newIssue] }));
    set(state => ({
      materials: state.materials.map(m =>
        m.id === issue.material_id ? { ...m, status: 'issue' } : m
      ),
    }));
    if (issue.batch_id) {
      set(state => ({
        batches: state.batches.map(b =>
          b.id === issue.batch_id ? { ...b, issue_count: b.issue_count + 1, inspected_count: b.inspected_count + 1 } : b
        ),
      }));
    }
  },

  updateIssueStatus: (issueId, status) => {
    set(state => ({
      issues: state.issues.map(i =>
        i.id === issueId ? { ...i, status, updated_at: new Date().toISOString() } : i
      ),
    }));
  },

  reviewIssue: (issueId, result, comment) => {
    const status: Issue['status'] = result === 'passed' ? 'resolved' : 'rejected';
    set(state => ({
      issues: state.issues.map(i =>
        i.id === issueId ? { ...i, status, updated_at: new Date().toISOString() } : i
      ),
    }));
  },

  calculateStatistics: () => {
    const { batches, issues } = get();
    
    const byTeam = batches.reduce((acc, batch) => {
      const team = acc.find(t => t.team_name === batch.team_name);
      const teamIssues = issues.filter(i => i.batch_id === batch.id);
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
    }, [] as Statistics['byTeam']);

    const byRoadType = batches.reduce((acc, batch) => {
      const roadType = acc.find(r => r.road_type === batch.road_type);
      const typeIssues = issues.filter(i => i.batch_id === batch.id);
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
    }, [] as Statistics['byRoadType']);

    const issueTypeCounts: Record<string, number> = {};
    issues.forEach(issue => {
      issueTypeCounts[issue.type] = (issueTypeCounts[issue.type] || 0) + 1;
    });
    const totalIssues = issues.length;
    const byIssueType = Object.entries(issueTypeCounts).map(([type, count]) => ({
      issue_type: type,
      count,
      percentage: totalIssues > 0 ? (count / totalIssues) * 100 : 0,
    }));

    set({ statistics: { byTeam, byRoadType, byIssueType } });
  },
}));
