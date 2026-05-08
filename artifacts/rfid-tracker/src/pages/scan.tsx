import { useState } from "react";
import { Layout } from "@/components/layout";
import { useInventoryScan } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ScanLine, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Scan() {
  const [input, setInput] = useState("");
  const scanMutation = useInventoryScan();
  const { toast } = useToast();

  const handleScan = () => {
    const tools = input.split(/[\n,]+/).map(t => t.trim()).filter(Boolean);
    if (tools.length === 0) return;

    scanMutation.mutate({ data: { scannedTools: tools } }, {
      onError: (err: any) => {
        toast({ title: "Scan Failed", description: err?.data?.error || "An error occurred", variant: "destructive" });
      }
    });
  };

  const results = scanMutation.data;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Bulk RFID Scan</h1>
          <p className="text-muted-foreground">Simulate gateway scanner input</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-sm shadow-sm">
            <CardHeader className="bg-muted/50 border-b border-border">
              <CardTitle className="uppercase tracking-wider text-sm flex items-center gap-2">
                <ScanLine className="w-4 h-4" />
                Raw Scanner Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Textarea 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Paste or scan comma/newline separated RFID tags..."
                className="font-mono min-h-[300px] resize-none p-4 rounded-sm border-2 focus-visible:ring-primary"
              />
              <Button 
                onClick={handleScan} 
                disabled={scanMutation.isPending || !input.trim()}
                className="w-full font-bold tracking-widest h-12"
              >
                {scanMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "PROCESS BATCH"}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {results ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="rounded-sm border-t-4 border-t-green-500 shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Matched</div>
                      <div className="text-4xl font-mono font-bold text-green-600">{results.summary.correct}</div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-sm border-t-4 border-t-destructive shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Missing</div>
                      <div className="text-4xl font-mono font-bold text-destructive">{results.summary.missing}</div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-sm border-t-4 border-t-secondary shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Extra</div>
                      <div className="text-4xl font-mono font-bold text-secondary">{results.summary.extra}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {results.missingTools.length > 0 && (
                    <Card className="border-destructive/30 rounded-sm">
                      <CardHeader className="py-3 bg-destructive/5 border-b border-destructive/10">
                        <CardTitle className="text-sm font-bold text-destructive flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          MISSING ASSETS
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 flex flex-wrap gap-2">
                        {results.missingTools.map(id => (
                          <Badge key={id} variant="outline" className="font-mono text-destructive border-destructive/30">{id}</Badge>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {results.extraTools.length > 0 && (
                    <Card className="border-secondary/30 rounded-sm">
                      <CardHeader className="py-3 bg-secondary/5 border-b border-secondary/10">
                        <CardTitle className="text-sm font-bold text-secondary-foreground flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" />
                          UNEXPECTED / EXTRA ASSETS
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 flex flex-wrap gap-2">
                        {results.extraTools.map(id => (
                          <Badge key={id} variant="outline" className="font-mono bg-secondary/20 text-secondary-foreground border-transparent">{id}</Badge>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {results.correctTools.length > 0 && (
                    <Card className="border-green-500/30 rounded-sm">
                      <CardHeader className="py-3 bg-green-500/5 border-b border-green-500/10">
                        <CardTitle className="text-sm font-bold text-green-700 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          VERIFIED ASSETS
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                        {results.correctTools.map(id => (
                          <Badge key={id} variant="outline" className="font-mono text-green-700 border-green-500/30">{id}</Badge>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-sm text-muted-foreground p-8 text-center uppercase tracking-widest font-bold text-sm">
                Awaiting scan payload...
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
