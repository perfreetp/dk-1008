export interface Batch {
  id: string;
  name: string;
  status: 'pending' | 'inspecting' | 'completed' | 'reviewing';
  road_type: string;
  team_id: string;
  road_id: string;
  material_count: number;
  inspected_count: number;
  issue_count: number;
  created_at: string;
  updated_at: string;
  team_name?: string;
  road_name?: string;
}

export interface Material {
  id: string;
  batch_id: string;
  type: 'image' | 'video';
  url: string;
  latitude: number;
  longitude: number;
  direction: string;
  captured_at: string;
  status: 'pending' | 'passed' | 'issue';
}

export interface Issue {
  id: string;
  batch_id: string;
  material_id: string;
  type: 'blur' | 'occlusion' | 'duplicate' | 'mileage_error' | 'tag_deviation';
  description: string;
  screenshot_url?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
  created_at: string;
  updated_at: string;
  material_url?: string;
  batch_name?: string;
  review_comment?: string;
  road_name?: string;
  road_type?: string;
  latitude?: number;
  longitude?: number;
  direction?: string;
  rectification_note?: string;
}

export interface Review {
  id: string;
  issue_id: string;
  result: 'passed' | 'rejected';
  comment: string;
  reviewed_at: string;
}

export interface Team {
  id: string;
  name: string;
  leader: string;
}

export interface Road {
  id: string;
  name: string;
  type: string;
  length: number;
}

export interface Statistics {
  byTeam: {
    team_name: string;
    total_batches: number;
    total_materials: number;
    issue_count: number;
    pass_rate: number;
  }[];
  byRoadType: {
    road_type: string;
    total_batches: number;
    issue_count: number;
  }[];
  byIssueType: {
    issue_type: string;
    count: number;
    percentage: number;
  }[];
}

export type IssueType = Issue['type'];

export const ISSUE_TYPE_MAP: Record<IssueType, string> = {
  blur: '模糊',
  occlusion: '遮挡',
  duplicate: '重复',
  mileage_error: '桩号错误',
  tag_deviation: '标签偏差',
};

export const STATUS_MAP: Record<string, string> = {
  pending: '待处理',
  inspecting: '抽检中',
  completed: '已完成',
  reviewing: '复核中',
  passed: '已通过',
  issue: '有问题',
  rejected: '已退回',
  resolved: '已解决',
};
