import { useState } from "react";
import { Layout } from "@/components/layout";
import { useIssueTool, useReturnTool, getGetStatsQueryKey, getListToolsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRightLeft, ArrowLeftRight } from "lucide-react";

export function Issue() {
  const [toolId, setToolId] = useState("");
  const [userId, setUserId] = useState("");
  const issueMutation = useIssueTool();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    issueMutation.mutate({ data: { toolId, userId } }, {
      onSuccess: (tx) => {
        toast({ title: "Tool Issued", description: `Assigned to ${userId}` });
        setToolId("");
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Issue Failed", description: err?.data?.error || "Error issuing tool", variant: "destructive" });
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Issue Asset</h1>
          <p className="text-muted-foreground">Assign tool to operator</p>
        </div>

        <Card className="rounded-sm border-t-4 border-t-primary shadow-md">
          <CardHeader className="bg-muted/30 border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              AUTHORIZE DEPLOYMENT
            </CardTitle>
            <CardDescription>Scan RFID or enter manually</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleIssue} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="toolId" className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Asset RFID</Label>
                <Input 
                  id="toolId" 
                  value={toolId} 
                  onChange={e => setToolId(e.target.value)} 
                  className="font-mono text-lg h-12" 
                  autoFocus 
                  required 
                  placeholder="SCAN OR TYPE ID..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userId" className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Operator ID</Label>
                <Input 
                  id="userId" 
                  value={userId} 
                  onChange={e => setUserId(e.target.value)} 
                  className="font-mono text-lg h-12" 
                  required 
                  placeholder="OPERATOR BADGE..."
                />
              </div>
              <Button type="submit" disabled={issueMutation.isPending} className="w-full h-12 font-bold tracking-widest text-lg">
                {issueMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "ISSUE ASSET"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export function Return() {
  const [toolId, setToolId] = useState("");
  const returnMutation = useReturnTool();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault();
    returnMutation.mutate({ data: { toolId } }, {
      onSuccess: () => {
        toast({ title: "Tool Returned", description: `Asset received back into inventory` });
        setToolId("");
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Return Failed", description: err?.data?.error || "Error returning tool", variant: "destructive" });
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Return Asset</h1>
          <p className="text-muted-foreground">Check tool back into inventory</p>
        </div>

        <Card className="rounded-sm border-t-4 border-t-secondary shadow-md">
          <CardHeader className="bg-muted/30 border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5" />
              PROCESS RETURN
            </CardTitle>
            <CardDescription>Scan RFID or enter manually</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleReturn} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="toolId" className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Asset RFID</Label>
                <Input 
                  id="toolId" 
                  value={toolId} 
                  onChange={e => setToolId(e.target.value)} 
                  className="font-mono text-lg h-12" 
                  autoFocus 
                  required 
                  placeholder="SCAN OR TYPE ID..."
                />
              </div>
              <Button type="submit" disabled={returnMutation.isPending} variant="secondary" className="w-full h-12 font-bold tracking-widest text-lg">
                {returnMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "CONFIRM RETURN"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
