import { Layout } from "@/components/layout";
import { useListTransactions } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Transactions() {
  const { data: transactions, isLoading } = useListTransactions({ limit: 100 });

  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Audit Log</h1>
          <p className="text-muted-foreground">Historical asset movements</p>
        </div>

        <div className="bg-card border border-border shadow-sm rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="uppercase text-xs font-bold tracking-wider">Date/Time</TableHead>
                  <TableHead className="uppercase text-xs font-bold tracking-wider">Action</TableHead>
                  <TableHead className="uppercase text-xs font-bold tracking-wider">Asset ID</TableHead>
                  <TableHead className="uppercase text-xs font-bold tracking-wider">Asset Name</TableHead>
                  <TableHead className="uppercase text-xs font-bold tracking-wider">Operator</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : transactions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No transactions recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions?.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm whitespace-nowrap">
                        {format(new Date(tx.createdAt), "yyyy-MM-dd HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-sm font-bold uppercase text-[10px] tracking-wider border ${
                          tx.actionType === 'issue' ? 'bg-secondary/10 text-secondary-foreground border-secondary/20' : 'bg-green-500/10 text-green-700 border-green-500/20'
                        }`}>
                          {tx.actionType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{tx.toolId}</TableCell>
                      <TableCell className="font-medium">{tx.toolName || "-"}</TableCell>
                      <TableCell className="font-mono text-sm">{tx.userId || "SYS_RETURN"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
