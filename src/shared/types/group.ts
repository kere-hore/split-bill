export interface GroupMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  status: "outstanding" | "allocated";
  created_at: string;
  updated_at: string;
  members: GroupMember[];
}

export interface GroupListResponse {
  success: boolean;
  data: {
    groups: Group[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
      totalPages: number;
    };
  };
}

export interface GroupListParams {
  page?: number;
  limit?: number;
  status?: "outstanding" | "allocated" | "all";
}
