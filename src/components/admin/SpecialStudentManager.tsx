import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Star, StarOff, Shield, Users } from "lucide-react";
import { Student, useUpdateStudent } from "@/hooks/useStudents";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface SpecialStudentManagerProps {
  students: Student[];
  schoolId: string;
}

export const SpecialStudentManager = ({ students, schoolId }: SpecialStudentManagerProps) => {
  const [search, setSearch] = useState("");
  const [confirmStudent, setConfirmStudent] = useState<Student | null>(null);
  const [confirmAction, setConfirmAction] = useState<"add" | "remove">("add");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const specialStudents = useMemo(() => 
    students.filter((s: any) => s.is_special), 
    [students]
  );

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(s =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
      s.class.toLowerCase().includes(q) ||
      s.roll_number?.toLowerCase().includes(q) ||
      s.parent_email?.toLowerCase().includes(q)
    );
  }, [students, search]);

  const handleToggleSpecial = async (student: Student, makeSpecial: boolean) => {
    setLoading(true);
    try {
      // Update student is_special flag
      const { error: updateError } = await supabase
        .from("students")
        .update({ is_special: makeSpecial } as any)
        .eq("id", student.id);

      if (updateError) throw updateError;

      if (makeSpecial) {
        // Auto-discount all pending recurring fees (100% discount)
        // Fetch pending student_fees with their fee_structure to check recurrence
        const { data: pendingFees, error: feesError } = await supabase
          .from("student_fees")
          .select("id, amount, fee_structure_id, fee_structures(recurrence_type)")
          .eq("student_id", student.id)
          .eq("status", "pending");

        if (feesError) throw feesError;

        // Apply 100% discount only to recurring fees (monthly, annually)
        const recurringFees = (pendingFees || []).filter((f: any) => 
          f.fee_structures?.recurrence_type === "monthly" || 
          f.fee_structures?.recurrence_type === "annually"
        );

        if (recurringFees.length > 0) {
          for (const fee of recurringFees) {
            await supabase
              .from("student_fees")
              .update({ discount: fee.amount })
              .eq("id", fee.id);
          }
          toast.success(`${student.first_name} marked as special student. ${recurringFees.length} recurring fee(s) discounted 100%.`);
        } else {
          toast.success(`${student.first_name} marked as special student (Govt. Scheme).`);
        }
      } else {
        // Remove discount from pending recurring fees
        const { data: pendingFees } = await supabase
          .from("student_fees")
          .select("id, fee_structure_id, fee_structures(recurrence_type)")
          .eq("student_id", student.id)
          .eq("status", "pending");

        const recurringFees = (pendingFees || []).filter((f: any) => 
          f.fee_structures?.recurrence_type === "monthly" || 
          f.fee_structures?.recurrence_type === "annually"
        );

        if (recurringFees.length > 0) {
          for (const fee of recurringFees) {
            await supabase
              .from("student_fees")
              .update({ discount: 0 })
              .eq("id", fee.id);
          }
        }
        toast.success(`${student.first_name} removed from special students. Discounts reverted.`);
      }

      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student-fees"] });
      queryClient.invalidateQueries({ queryKey: ["all-student-fees"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update student");
    } finally {
      setLoading(false);
      setConfirmStudent(null);
    }
  };

  const openConfirm = (student: Student, action: "add" | "remove") => {
    setConfirmStudent(student);
    setConfirmAction(action);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{specialStudents.length}</p>
              <p className="text-xs text-muted-foreground">Special Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{students.length}</p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">Govt. Scheme</p>
              <p className="text-xs text-muted-foreground">100% fee discount on recurring</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <p className="text-sm text-foreground">
            <strong>Special Students (Government Scheme):</strong> Students marked as special receive 
            <strong> 100% discount on all recurring fees</strong> (tuition, transport, monthly, annual). 
            <strong> One-time fees</strong> (admission, etc.) will still be charged normally.
            When you mark a student as special, all their existing pending recurring fees will be auto-discounted.
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search students by name, class, roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Students</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredStudents.length === 0 ? (
              <p className="p-6 text-center text-muted-foreground">No students found</p>
            ) : (
              filteredStudents.map((student) => {
                const isSpecial = (student as any).is_special;
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSpecial ? 'bg-amber-500/20' : 'bg-primary/10'}`}>
                        {isSpecial ? (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        ) : (
                          <span className="text-xs font-semibold text-primary">
                            {student.first_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {student.first_name} {student.last_name}
                          {isSpecial && (
                            <Badge variant="outline" className="ml-2 border-amber-500 text-amber-600 text-[10px]">
                              Govt. Scheme
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Class {student.class}{student.section ? ` - ${student.section}` : ''}
                          {student.roll_number ? ` • Roll: ${student.roll_number}` : ''}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isSpecial ? "destructive" : "default"}
                      disabled={loading}
                      onClick={() => openConfirm(student, isSpecial ? "remove" : "add")}
                      className="gap-1.5"
                    >
                      {isSpecial ? (
                        <><StarOff className="w-3.5 h-3.5" /> Remove</>
                      ) : (
                        <><Star className="w-3.5 h-3.5" /> Mark Special</>
                      )}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <AlertDialog open={!!confirmStudent} onOpenChange={(open) => !open && setConfirmStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "add" ? "Mark as Special Student?" : "Remove Special Status?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "add" ? (
                <>
                  <strong>{confirmStudent?.first_name} {confirmStudent?.last_name}</strong> will be marked as a 
                  Government Scheme student. All pending recurring fees (tuition, transport, monthly, annual) 
                  will get <strong>100% discount</strong>. One-time fees will remain unchanged.
                </>
              ) : (
                <>
                  <strong>{confirmStudent?.first_name} {confirmStudent?.last_name}</strong> will be removed from 
                  special students. Pending recurring fee discounts will be <strong>reverted to ₹0</strong>.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={() => confirmStudent && handleToggleSpecial(confirmStudent, confirmAction === "add")}
            >
              {loading ? "Processing..." : confirmAction === "add" ? "Yes, Mark Special" : "Yes, Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
