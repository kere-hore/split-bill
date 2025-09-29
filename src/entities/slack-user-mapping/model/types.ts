export interface SlackUserMapping {
  id: string
  userId?: string
  groupId: string
  memberName: string
  memberEmail?: string
  slackUsername?: string
  mappingStatus: 'pending' | 'active' | 'skipped'
  createdAt: Date
  updatedAt: Date
}

export interface MappingSuggestion {
  memberId: string
  memberName: string
  memberEmail?: string
  suggestedUsername?: string
  confidence: 'high' | 'medium' | 'low'
}

export interface UpdateMappingData {
  slackUsername?: string
  mappingStatus?: 'pending' | 'active' | 'skipped'
}