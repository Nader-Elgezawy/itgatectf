import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Flag, FileText, Clock, ShieldCheck } from 'lucide-react';
import { ChallengesManager } from '@/components/admin/ChallengesManager';
import { TeamsManager } from '@/components/admin/TeamsManager';
import { SubmissionsViewer } from '@/components/admin/SubmissionsViewer';
import { TimerControl } from '@/components/admin/TimerControl';
import { RolesManager } from '@/components/admin/RolesManager';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('challenges');

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-mono flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-2 font-mono">
            <span className="text-primary">&gt;</span> Manage the CTF platform
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="challenges" className="font-mono">
              <Flag className="h-4 w-4 mr-2" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="teams" className="font-mono">
              <Users className="h-4 w-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="submissions" className="font-mono">
              <FileText className="h-4 w-4 mr-2" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="timer" className="font-mono">
              <Clock className="h-4 w-4 mr-2" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="roles" className="font-mono">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="mt-6">
            <ChallengesManager />
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            <TeamsManager />
          </TabsContent>

          <TabsContent value="submissions" className="mt-6">
            <SubmissionsViewer />
          </TabsContent>

          <TabsContent value="timer" className="mt-6">
            <TimerControl />
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <RolesManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
