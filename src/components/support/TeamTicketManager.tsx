import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAllTickets, useUpdateTicketStatus, SupportTicket, TicketStatus } from "@/hooks/useSupportTickets";
import { format } from "date-fns";
import { Eye, Filter } from "lucide-react";

const statusColors: Record<TicketStatus, string> = {
  open: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  resolved: 'bg-green-500/10 text-green-600 border-green-500/20',
  closed: 'bg-muted text-muted-foreground border-muted',
};

const categoryLabels: Record<string, string> = {
  payment: 'Payment',
  technical: 'Technical',
  account: 'Account',
  fee_structure: 'Fee Structure',
  notification: 'Notification',
  other: 'Other',
};

export const TeamTicketManager = () => {
  const { data: tickets, isLoading } = useAllTickets();
  const updateStatus = useUpdateTicketStatus();
  
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [resolutionNote, setResolutionNote] = useState('');

  const filteredTickets = tickets?.filter(ticket => {
    if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
    if (filterCategory !== 'all' && ticket.category !== filterCategory) return false;
    return true;
  }) || [];

  const handleStatusChange = async (status: TicketStatus) => {
    if (!selectedTicket) return;
    
    await updateStatus.mutateAsync({
      ticketId: selectedTicket.id,
      status,
      resolution_note: (status === 'resolved' || status === 'closed') ? resolutionNote : undefined,
    });
    
    setSelectedTicket(null);
    setResolutionNote('');
  };

  const openCount = tickets?.filter(t => t.status === 'open').length || 0;
  const inProgressCount = tickets?.filter(t => t.status === 'in_progress').length || 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tickets?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{openCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {tickets?.filter(t => t.status === 'resolved').length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="account">Account</SelectItem>
            <SelectItem value="fee_structure">Fee Structure</SelectItem>
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets Table */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No tickets found</div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>User</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {ticket.subject}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{ticket.user_profile?.full_name || 'Unknown'}</p>
                      <p className="text-muted-foreground text-xs">{ticket.user_profile?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{ticket.school?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[ticket.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[ticket.status]}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{categoryLabels[selectedTicket.category]}</Badge>
                <Badge className={statusColors[selectedTicket.status]}>
                  {selectedTicket.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-semibold">{selectedTicket.subject}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  By {selectedTicket.user_profile?.full_name || 'Unknown'} 
                  {selectedTicket.school?.name && ` • ${selectedTicket.school.name}`}
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>

              {selectedTicket.resolution_note && (
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-xs font-medium text-green-600 mb-1">Resolution Note:</p>
                  <p className="text-sm">{selectedTicket.resolution_note}</p>
                </div>
              )}

              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <>
                  <div className="space-y-2">
                    <Label>Resolution Note (optional)</Label>
                    <Textarea
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      placeholder="Add a note about how this was resolved..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    {selectedTicket.status === 'open' && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleStatusChange('in_progress')}
                        disabled={updateStatus.isPending}
                      >
                        Mark In Progress
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleStatusChange('resolved')}
                      disabled={updateStatus.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark Resolved
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleStatusChange('closed')}
                      disabled={updateStatus.isPending}
                    >
                      Close
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
