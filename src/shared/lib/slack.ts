import axios from 'axios'

export interface SlackMessage {
  text: string
  blocks?: any[]
}

export interface SlackUserMapping {
  id: string
  userId?: string
  groupId: string
  memberName: string
  memberEmail?: string
  slackUsername?: string
  mappingStatus: 'pending' | 'active' | 'skipped'
}

export async function sendToSlackWebhook(webhookUrl: string, message: SlackMessage): Promise<boolean> {
  try {
    const response = await axios.post(webhookUrl, message, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    })
    return response.status === 200
  } catch (error) {
    console.error('Slack webhook error:', error)
    return false
  }
}

export function generateSlackMessage(groupData: any, mappings: SlackUserMapping[]): SlackMessage {
  const memberList = groupData.members.map((member: any) => {
    const mapping = mappings.find(m => 
      m.userId === member.userId || m.memberName === member.name
    )
    
    if (mapping?.slackUsername && mapping.mappingStatus === 'active') {
      const username = mapping.slackUsername.replace('@', '')
      return `• <@${username}>`
    } else {
      return `• ${member.name}`
    }
  }).join('\n')

  const merchantName = groupData.bill?.merchantName || 'Split Bill'
  const totalAmount = formatCurrency(groupData.bill?.totalAmount || 0)
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://split-bill-mu.vercel.app'}/public/bills/${groupData.id}`

  return {
    text: `🍕 *${merchantName} Split Bill*
Total: ${totalAmount}

💰 *Breakdown:*
${memberList}

📋 Details: ${publicUrl}`
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}