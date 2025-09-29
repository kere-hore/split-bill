'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Plus, Trash2, Settings, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { SlackConfigForm } from '@/features/slack-integration'
import { useSlackSettings } from '@/features/slack-integration/model/use-slack-settings'
import { SlackUserMappingsTab } from './slack-user-mappings-tab'

interface SlackSettingsSectionProps {
  groupId?: string
}

export function SlackSettingsSection({ groupId = 'global' }: SlackSettingsSectionProps) {
  const {
    configs,
    isLoading,
    isDeleting,
    isConfigModalOpen,
    setIsConfigModalOpen,
    handleCreateConfig,
    handleDeleteConfig
  } = useSlackSettings()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Slack Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Slack Integration
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure Slack webhooks and user mappings for your team
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="webhooks" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="webhooks">Webhook Configs</TabsTrigger>
            <TabsTrigger value="mappings">User Mappings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="webhooks" className="space-y-4 mt-4">
        {configs.length > 0 ? (
          <div className="space-y-3">
            {configs.map((config) => (
              <div
                key={config.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{config.name}</span>
                    <Badge variant={config.isActive ? 'default' : 'secondary'}>
                      {config.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {config.channelName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteConfig(config.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed rounded-lg">
            <Settings className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              No Slack configurations yet
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Add a Slack webhook to start sharing split bills
            </p>
          </div>
        )}

            <Button
              onClick={() => setIsConfigModalOpen(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Slack Configuration
            </Button>
          </TabsContent>
          
          <TabsContent value="mappings" className="space-y-4 mt-4">
            <SlackUserMappingsTab />
          </TabsContent>
        </Tabs>

        <SlackConfigForm
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          onSubmit={handleCreateConfig}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  )
}