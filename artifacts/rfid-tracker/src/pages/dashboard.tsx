import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetStats } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = useGetStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">System Overview</h1>
          <p className="text-muted-foreground">Real-time inventory metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary rounded-sm shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Assets</CardTitle>
              <Wrench className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{stats?.totalTools || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 rounded-sm shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Available</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{stats?.availableTools || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary rounded-sm shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Issued</CardTitle>
              <AlertTriangle className="w-4 h-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{stats?.issuedTools || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-destructive rounded-sm shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Missing</CardTitle>
              <XCircle className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{stats?.missingTools || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 rounded-sm shadow-sm border border-border">
            <CardHeader className="bg-muted/50 border-b border-border">
              <CardTitle className="text-sm uppercase tracking-wider">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                <div className="divide-y divide-border">
                  {stats.recentTransactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          tx.actionType === 'issue' ? 'bg-secondary/20 text-secondary-foreground' : 'bg-green-500/20 text-green-700'
                        }`}>
                          {tx.actionType}
                        </div>
                        <div>
                          <p className="font-medium">{tx.toolName || tx.toolId}</p>
                          <p className="text-xs text-muted-foreground font-mono">{tx.toolId} &bull; {tx.userId || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {format(new Date(tx.createdAt), "MMM d, HH:mm")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">No recent activity</div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-sm shadow-sm border border-border">
            <CardHeader className="bg-muted/50 border-b border-border">
              <CardTitle className="text-sm uppercase tracking-wider">Category Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {stats.categoryBreakdown.map((cat) => (
                    <div key={cat.category}>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="font-medium">{cat.category}</span>
                        <span className="font-mono text-muted-foreground">{cat.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${(cat.count / stats.totalTools) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
