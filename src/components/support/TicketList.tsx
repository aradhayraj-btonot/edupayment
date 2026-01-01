import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupportTicket, TicketStatus } from "@/hooks/useSupportTickets";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";

interface TicketListProps {
  tickets: SupportTicket[];
  isLoading?: boolean;
}

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

export const TicketList = ({ tickets, isLoading }: TicketListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading tickets...
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No support tickets found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{ticket.subject}</CardTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {categoryLabels[ticket.category] || ticket.category}
                  </Badge>
                  <span>•</span>
                  <span>{format(new Date(ticket.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
              <Badge className={statusColors[ticket.status]}>
                {ticket.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
            {ticket.resolution_note && (
              <div className="mt-3 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                <p className="text-xs font-medium text-green-600 mb-1">Resolution:</p>
                <p className="text-sm text-muted-foreground">{ticket.resolution_note}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
