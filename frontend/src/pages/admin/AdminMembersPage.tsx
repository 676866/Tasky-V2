import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth-store";
import { useAdminStore } from "@/store/admin-store";
import { api } from "@/lib/api";
import { User, Task, Organization } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Search, Bell, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SendReminderDialog } from "@/components/admin/SendReminderDialog";
import { AdminOrgSelector } from "@/components/admin/AdminOrgSelector";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import * as XLSX from "xlsx";

const columnHelper = createColumnHelper<User & { taskCount: number; completedCount: number }>();

export default function AdminMembersPage() {
  const { user } = useAuthStore();
  const { selectedOrgId } = useAdminStore();
  const orgId = selectedOrgId || user?.organizationId;
  const [members, setMembers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    if (!user) return;
    if (!orgId) { setLoading(false); return; }
    Promise.all([
      api.getMembers(orgId),
      api.getTasks(user.id, orgId),
      api.getOrganization(orgId),
    ]).then(([m, t, o]) => {
      setMembers(m); setTasks(t); setOrg(o ?? null); setLoading(false);
    });
  }, [user, orgId]);

  const data = useMemo(() =>
    members.map((m) => ({
      ...m,
      taskCount: tasks.filter((t) => t.assigneeId === m.id).length,
      completedCount: tasks.filter((t) => t.assigneeId === m.id && t.status === "done").length,
    })),
    [members, tasks]
  );

  const columns = useMemo(() => [
    columnHelper.display({
      id: "avatar",
      header: "",
      cell: ({ row }) => (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {row.original.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
      ),
      size: 48,
    }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue()}</span>,
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: ({ getValue }) => (
        <Badge variant={getValue() === "admin" ? "default" : "secondary"}>{getValue()}</Badge>
      ),
    }),
    columnHelper.accessor("taskCount", {
      header: "Tasks",
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    }),
    columnHelper.accessor("completedCount", {
      header: "Completed",
      cell: ({ getValue }) => <span className="text-success font-medium">{getValue()}</span>,
    }),
    columnHelper.display({
      id: "rate",
      header: "Rate",
      cell: ({ row }) => {
        const { taskCount, completedCount } = row.original;
        const rate = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
        return <span className="text-sm">{rate}%</span>;
      },
    }),
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const handleSendReminder = async (taskId: string, recipientId: string, message: string) => {
    if (!orgId) return;
    await api.sendReminder(taskId, user!.id, recipientId, message, orgId);
    toast.success("Reminder sent!");
  };

  const copyInviteCode = () => {
    if (org) {
      navigator.clipboard.writeText(org.inviteCode);
      toast.success("Invite code copied!");
    }
  };

  const exportToExcel = () => {
    const exportData = data.map((m) => ({
      Name: m.name,
      Email: m.email,
      Role: m.role,
      "Total Tasks": m.taskCount,
      Completed: m.completedCount,
      "Completion Rate": m.taskCount > 0 ? `${Math.round((m.completedCount / m.taskCount) * 100)}%` : "0%",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, `${org?.name || "organization"}-members.xlsx`);
    toast.success("Members exported to Excel");
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold">Members</h1>
            <AdminOrgSelector />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToExcel} disabled={data.length === 0}>
              <Download className="w-4 h-4 mr-1" /> Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => setReminderOpen(true)}>
              <Bell className="w-4 h-4 mr-1" /> Remind
            </Button>
            <div className="flex items-center gap-1 bg-muted rounded-lg px-3 py-1.5">
              <code className="text-sm font-mono font-semibold">{org?.inviteCode || "—"}</code>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyInviteCode}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-9"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                      <TableRow key={hg.id}>
                        {hg.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === "asc" ? " ↑" : header.column.getIsSorted() === "desc" ? " ↓" : ""}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                          No members found
                        </TableCell>
                      </TableRow>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {table.getPageCount() > 1 && (
                  <div className="flex items-center justify-between p-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <SendReminderDialog
          open={reminderOpen}
          onOpenChange={setReminderOpen}
          onSubmit={handleSendReminder}
          tasks={tasks.filter((t) => t.status !== "done")}
          members={members.filter((m) => m.id !== user?.id)}
        />
      </div>
    </DashboardLayout>
  );
}
