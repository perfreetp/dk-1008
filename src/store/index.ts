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

const STORAGE_KEY = 'road-quality-inspection';

const loadFromStorage = (): Partial<AppState> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load from storage:', e);
  }
  return {};
};

const savedData = loadFromStorage();

export const useAppStore = create<AppState>((set, get) => ({
  batches: savedData.batches || mockBatches,
  materials: savedData.materials || mockMaterials,
  issues: savedData.issues || mockIssues,
  currentBatch: null,
  currentMaterial: null,
  selectedBatchId: savedData.selectedBatchId || null,
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
    const materials = get().materials;
    const material = materials.find(m => m.id === materialId);
    const passedStatus: Material['status'] = 'passed';
    
    if (material && material.status === 'pending') {
      set(state => {
        const newBatches = state.batches.map(b =>
          b.id === material?.batch_id ? { ...b, inspected_count: b.inspected_count + 1 } : b
        );
        const newMaterials = state.materials.map(m =>
          m.id === materialId ? { ...m, status: passedStatus } : m
        );
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          batches: newBatches,
          materials: newMaterials,
          issues: state.issues,
          selectedBatchId: state.selectedBatchId,
        }));
        
        return { batches: newBatches, materials: newMaterials };
      });
    }
  },

  createIssue: (issue) => {
    const materials = get().materials;
    const material = materials.find(m => m.id === issue.material_id);
    const issueStatus: Material['status'] = 'issue';
    
    if (material && material.status === 'pending') {
      const newIssue: Issue = {
        ...issue,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set(state => {
        const newIssues = [...state.issues, newIssue];
        const newMaterials = state.materials.map(m =>
          m.id === issue.material_id ? { ...m, status: issueStatus } : m
        );
        const newBatches = state.batches.map(b =>
          b.id === issue.batch_id 
            ? { ...b, issue_count: b.issue_count + 1, inspected_count: b.inspected_count + 1 } 
            : b
        );
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          batches: newBatches,
          materials: newMaterials,
          issues: newIssues,
          selectedBatchId: state.selectedBatchId,
        }));
        
        return { batches: newBatches, materials: newMaterials, issues: newIssues };
      });
    }
  },

  updateIssueStatus: (issueId, status) => {
    set(state => {
      const newIssues = state.issues.map(i =>
        i.id === issueId ? { ...i, status, updated_at: new Date().toISOString() } : i
      );
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        batches: state.batches,
        materials: state.materials,
        issues: newIssues,
        selectedBatchId: state.selectedBatchId,
      }));
      
      return { issues: newIssues };
    });
  },

  reviewIssue: (issueId, result, comment) => {
    const status: Issue['status'] = result === 'passed' ? 'resolved' : 'rejected';
    set(state => {
      const newIssues = state.issues.map(i =>
        i.id === issueId ? { 
          ...i, 
          status, 
          updated_at: new Date().toISOString(),
          review_comment: comment 
        } : i
      );
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        batches: state.batches,
        materials: state.materials,
        issues: newIssues,
        selectedBatchId: state.selectedBatchId,
      }));
      
      return { issues: newIssues };
    });
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
