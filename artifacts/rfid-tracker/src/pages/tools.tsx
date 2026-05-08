import { useState, useRef } from "react";
import { Layout } from "@/components/layout";
import { 
  useListTools, 
  useCreateTool, 
  useDeleteTool,
  getListToolsQueryKey,
  useUpdateTool
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Trash2, Edit2 } from "lucide-react";
import { format } from "date-fns";

export default function Tools() {
  const [search, setSearch] = useState("");
  const { data: tools, isLoading } = useListTools();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createMutation = useCreateTool();
  const deleteMutation = useDeleteTool();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTool, setNewTool] = useState({ toolId: "", name: "", category: "General", status: "Available" as any });

  const filteredTools = tools?.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.toolId.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: newTool }, {
      onSuccess: () => {
        toast({ title: "Tool added" });
        setIsAddOpen(false);
        setNewTool({ toolId: "", name: "", category: "General", status: "Available" });
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.data?.error || "Failed to add tool", variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this tool?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Tool deleted" });
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
      }
    });
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">Tool Master</h1>
            <p className="text-muted-foreground">Manage inventory registry</p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-sm font-bold tracking-wide">
                <Plus className="w-4 h-4 mr-2" />
                ADD TOOL
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-sm">
              <DialogHeader>
                <DialogTitle className="uppercase tracking-wide">Register New Asset</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="toolId">RFID Tag ID</Label>
                  <Input id="toolId" required value={newTool.toolId} onChange={e => setNewTool({...newTool, toolId: e.target.value})} className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Tool Name</Label>
                  <Input id="name" required value={newTool.name} onChange={e => setNewTool({...newTool, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" required value={newTool.category} onChange={e => setNewTool({...newTool, category: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Initial Status</Label>
                  <Select value={newTool.status} onValueChange={(val: any) => setNewTool({...newTool, status: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Issued">Issued</SelectItem>
                      <SelectItem value="Missing">Missing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending} className="w-full font-bold">
                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    REGISTER ASSET
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card border border-border shadow-sm rounded-sm">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by ID, name, or category..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-sm border-0 focus-visible:ring-0 px-0 shadow-none h-8 font-mono bg-transparent"
            />
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="uppercase text-xs font-bold tracking-wider">RFID Tag</TableHead>
                  <TableHead className="uppercase text-xs font-bold tracking-wider">Name</TableHead>
                  <TableHead className="uppercase text-xs font-bold tracking-wider">Category</TableHead>
                  <TableHead className="uppercase text-xs font-bold tracking-wider">Status</TableHead>
                  <TableHead className="uppercase text-xs font-bold tracking-wider">Updated</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredTools?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No tools found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTools?.map((tool) => (
                    <TableRow key={tool.id}>
                      <TableCell className="font-mono text-sm">{tool.toolId}</TableCell>
                      <TableCell className="font-medium">{tool.name}</TableCell>
                      <TableCell>{tool.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-sm font-bold uppercase text-[10px] tracking-wider border ${
                          tool.status === 'Available' ? 'bg-green-500/10 text-green-700 border-green-500/20' :
                          tool.status === 'Issued' ? 'bg-secondary/10 text-secondary-foreground border-secondary/20' :
                          'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                          {tool.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(tool.updatedAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tool.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
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
