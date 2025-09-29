'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'

interface SlackConfigFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; webhookUrl: string; channelName: string }) => void
  isLoading?: boolean
}

export function SlackConfigForm({ isOpen, onClose, onSubmit, isLoading }: SlackConfigFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    webhookUrl: '',
    channelName: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleClose = () => {
    setFormData({ name: '', webhookUrl: '', channelName: '' })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Slack Configuration</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Configuration Name</Label>
            <Input
              id="name"
              placeholder="e.g., Food Orders Channel"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Slack Webhook URL</Label>
            <Input
              id="webhookUrl"
              placeholder="https://hooks.slack.com/services/..."
              value={formData.webhookUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="channelName">Channel Name</Label>
            <Input
              id="channelName"
              placeholder="e.g., #general"
              value={formData.channelName}
              onChange={(e) => setFormData(prev => ({ ...prev, channelName: e.target.value }))}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Configuration'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}