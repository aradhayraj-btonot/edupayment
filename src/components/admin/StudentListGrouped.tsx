import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Edit, Trash2, Search, Users, Upload } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Student } from "@/hooks/useStudents";

interface StudentListGroupedProps {
  students: Student[];
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onBulkImport: () => void;
}

interface GroupedStudents {
  [className: string]: {
    [section: string]: Student[];
  };
}

export const StudentListGrouped = ({
  students,
  onEditStudent,
  onDeleteStudent,
  onBulkImport,
}: StudentListGroupedProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openClasses, setOpenClasses] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.class.toLowerCase().includes(q) ||
        (s.roll_number && s.roll_number.toLowerCase().includes(q)) ||
        (s.parent_email && s.parent_email.toLowerCase().includes(q))
    );
  }, [students, searchQuery]);

  const grouped = useMemo(() => {
    const result: GroupedStudents = {};
    filteredStudents.forEach((student) => {
      const cls = student.class || "Unassigned";
      const sec = student.section || "No Section";
      if (!result[cls]) result[cls] = {};
      if (!result[cls][sec]) result[cls][sec] = [];
      result[cls][sec].push(student);
    });
    return result;
  }, [filteredStudents]);

  // Sort classes naturally (1, 2, 3... 10, 11 etc.)
  const sortedClasses = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [grouped]);

  const toggleClass = (cls: string) => {
    setOpenClasses((prev) => {
      const next = new Set(prev);
      if (next.has(cls)) next.delete(cls);
      else next.add(cls);
      return next;
    });
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    setOpenClasses(new Set(sortedClasses));
    const allSections = new Set<string>();
    sortedClasses.forEach((cls) => {
      Object.keys(grouped[cls]).forEach((sec) => {
        allSections.add(`${cls}-${sec}`);
      });
    });
    setOpenSections(allSections);
  };

  const collapseAll = () => {
    setOpenClasses(new Set());
    setOpenSections(new Set());
  };

  const getClassStudentCount = (cls: string) => {
    return Object.values(grouped[cls]).reduce((sum, arr) => sum + arr.length, 0);
  };

  return (
    <div className="space-y-4">
      {/* Search + Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name, class, roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={onBulkImport}>
            <Upload className="w-4 h-4" />
            Bulk Import
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs">
          {filteredStudents.length} students
        </Badge>
        <Badge variant="outline" className="text-xs">
          {sortedClasses.length} classes
        </Badge>
      </div>

      {/* Grouped List */}
      {sortedClasses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{searchQuery ? "No students match your search." : "No students enrolled yet."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedClasses.map((cls) => {
            const sections = Object.keys(grouped[cls]).sort();
            const isClassOpen = openClasses.has(cls);

            return (
              <Collapsible key={cls} open={isClassOpen} onOpenChange={() => toggleClass(cls)}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
                    <div className="flex items-center gap-3">
                      {isClassOpen ? (
                        <ChevronDown className="w-5 h-5 text-primary" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-primary" />
                      )}
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">{cls}</span>
                      </div>
                      <span className="font-semibold text-foreground">Class {cls}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {getClassStudentCount(cls)} students
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {sections.length} section{sections.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-4 mt-1 space-y-1">
                    {sections.map((sec) => {
                      const sectionKey = `${cls}-${sec}`;
                      const isSectionOpen = openSections.has(sectionKey);
                      const sectionStudents = grouped[cls][sec];

                      return (
                        <Collapsible
                          key={sectionKey}
                          open={isSectionOpen}
                          onOpenChange={() => toggleSection(sectionKey)}
                        >
                          <CollapsibleTrigger asChild>
                            <button className="w-full flex items-center justify-between p-2.5 rounded-md bg-secondary/50 hover:bg-secondary transition-colors">
                              <div className="flex items-center gap-2">
                                {isSectionOpen ? (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="text-sm font-medium text-foreground">
                                  Section {sec}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {sectionStudents.length}
                              </Badge>
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="ml-6 mt-1 space-y-1">
                              {sectionStudents
                                .sort((a, b) => {
                                  const rollA = parseInt(a.roll_number || "999");
                                  const rollB = parseInt(b.roll_number || "999");
                                  if (!isNaN(rollA) && !isNaN(rollB)) return rollA - rollB;
                                  return a.first_name.localeCompare(b.first_name);
                                })
                                .map((student) => (
                                  <div
                                    key={student.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-primary/20 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-primary font-semibold text-xs">
                                          {student.first_name.charAt(0)}
                                          {student.last_name.charAt(0)}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-medium text-foreground text-sm">
                                          {student.first_name} {student.last_name}
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          {student.roll_number && (
                                            <span className="text-xs text-muted-foreground">
                                              Roll: {student.roll_number}
                                            </span>
                                          )}
                                          {student.parent_email && (
                                            <span className="text-xs text-primary/70">
                                              {student.parent_email}
                                            </span>
                                          )}
                                          {student.transport_charge > 0 && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                              Transport: ₹{Number(student.transport_charge).toLocaleString("en-IN")}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Badge
                                        variant={student.parent_id ? "default" : "secondary"}
                                        className="text-[10px]"
                                      >
                                        {student.parent_id ? "Linked" : "Pending"}
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => onEditStudent(student)}
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete {student.first_name}{" "}
                                              {student.last_name}? This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => onDeleteStudent(student.id)}
                                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
};
