import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, FileSpreadsheet, Image, FileText, Check, X, Loader2, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCreateStudent, type CreateStudentData } from "@/hooks/useStudents";

interface ParsedStudent {
  first_name: string;
  last_name: string;
  class: string;
  section?: string;
  roll_number?: string;
  parent_email?: string;
  transport_charge?: number;
  valid: boolean;
  error?: string;
}

interface BulkStudentImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
}

export const BulkStudentImport = ({ open, onOpenChange, schoolId }: BulkStudentImportProps) => {
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMethod, setImportMethod] = useState<"csv" | "ai" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const createStudent = useCreateStudent();

  const parseCSV = (text: string): ParsedStudent[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
    
    // Map common header variations
    const headerMap: Record<string, string> = {};
    headers.forEach((h, i) => {
      if (h.includes("first") && h.includes("name")) headerMap["first_name"] = headers[i];
      else if (h.includes("last") && h.includes("name")) headerMap["last_name"] = headers[i];
      else if (h === "name" || h === "student name" || h === "student_name") headerMap["full_name"] = headers[i];
      else if (h === "class" || h === "grade" || h === "std") headerMap["class"] = headers[i];
      else if (h === "section" || h === "sec" || h === "div" || h === "division") headerMap["section"] = headers[i];
      else if (h.includes("roll") || h === "roll_number" || h === "roll no") headerMap["roll_number"] = headers[i];
      else if (h.includes("parent") && h.includes("email") || h === "email") headerMap["parent_email"] = headers[i];
      else if (h.includes("transport") || h.includes("bus")) headerMap["transport_charge"] = headers[i];
    });

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/['"]/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] || "";
      });

      let first_name = "";
      let last_name = "";

      // Handle full name vs first/last name
      if (headerMap["full_name"]) {
        const parts = (row[headerMap["full_name"]] || "").split(" ");
        first_name = parts[0] || "";
        last_name = parts.slice(1).join(" ") || "";
      } else {
        first_name = row[headerMap["first_name"] || "first_name"] || row[headers[0]] || "";
        last_name = row[headerMap["last_name"] || "last_name"] || row[headers[1]] || "";
      }

      const cls = row[headerMap["class"] || "class"] || row[headers[2]] || "";
      const section = row[headerMap["section"] || "section"] || "";
      const roll_number = row[headerMap["roll_number"] || "roll_number"] || "";
      const parent_email = row[headerMap["parent_email"] || "parent_email"] || "";
      const transport = row[headerMap["transport_charge"] || "transport_charge"] || "0";

      const valid = !!first_name && !!last_name && !!cls;

      return {
        first_name,
        last_name,
        class: cls,
        section: section || undefined,
        roll_number: roll_number || undefined,
        parent_email: parent_email || undefined,
        transport_charge: parseFloat(transport) || 0,
        valid,
        error: !valid ? "Missing required fields (first name, last name, class)" : undefined,
      };
    }).filter(s => s.first_name || s.last_name); // Filter out empty rows
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportMethod("csv");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setParsedStudents(parsed);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
      setIsProcessing(false);
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAIUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportMethod("ai");

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]); // Remove data:... prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("parse-students", {
        body: {
          file_base64: base64,
          file_type: file.type,
          file_name: file.name,
        },
      });

      if (error) throw error;

      if (data?.students && Array.isArray(data.students)) {
        const parsed: ParsedStudent[] = data.students.map((s: any) => ({
          first_name: s.first_name || "",
          last_name: s.last_name || "",
          class: s.class || "",
          section: s.section || undefined,
          roll_number: s.roll_number || undefined,
          parent_email: s.parent_email || undefined,
          transport_charge: parseFloat(s.transport_charge) || 0,
          valid: !!(s.first_name && s.last_name && s.class),
          error: !(s.first_name && s.last_name && s.class)
            ? "Missing required fields"
            : undefined,
        }));
        setParsedStudents(parsed);
      } else {
        toast.error("AI could not extract student data from this file");
      }
    } catch (err: any) {
      console.error("AI parse error:", err);
      toast.error("Failed to process file with AI: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
      if (aiFileInputRef.current) aiFileInputRef.current.value = "";
    }
  };

  const handleImport = async () => {
    const validStudents = parsedStudents.filter((s) => s.valid);
    if (validStudents.length === 0) {
      toast.error("No valid students to import");
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const student of validStudents) {
      try {
        await createStudent.mutateAsync({
          school_id: schoolId,
          first_name: student.first_name,
          last_name: student.last_name,
          class: student.class,
          section: student.section || null,
          roll_number: student.roll_number || null,
          parent_email: student.parent_email || null,
          transport_charge: student.transport_charge || 0,
        });
        successCount++;
      } catch {
        errorCount++;
      }
    }

    setIsImporting(false);
    toast.success(`Imported ${successCount} students${errorCount > 0 ? `, ${errorCount} failed` : ""}`);
    setParsedStudents([]);
    setImportMethod(null);
    onOpenChange(false);
  };

  const removeStudent = (index: number) => {
    setParsedStudents((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadTemplate = () => {
    const csv = "first_name,last_name,class,section,roll_number,parent_email,transport_charge\nJohn,Doe,10,A,1,john.parent@email.com,1500\nJane,Smith,10,B,2,jane.parent@email.com,0";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedStudents.filter((s) => s.valid).length;
  const invalidCount = parsedStudents.filter((s) => !s.valid).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Students</DialogTitle>
        </DialogHeader>

        {parsedStudents.length === 0 && !isProcessing ? (
          <div className="space-y-6">
            {/* Upload Options */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* CSV Upload */}
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-7 h-7 text-success" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">CSV / Spreadsheet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a .csv file with student data
                    </p>
                  </div>
                </CardContent>
              </Card>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleCSVUpload}
                className="hidden"
              />

              {/* AI Upload (Image/PDF) */}
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => aiFileInputRef.current?.click()}
              >
                <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Image className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">Image / PDF (AI)</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a screenshot, photo, or PDF — AI will extract data
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Powered by AI</Badge>
                </CardContent>
              </Card>
              <input
                ref={aiFileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleAIUpload}
                className="hidden"
              />
            </div>

            {/* Template Download */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Download CSV Template</p>
                  <p className="text-xs text-muted-foreground">
                    Pre-formatted template with correct column headers
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                Download
              </Button>
            </div>
          </div>
        ) : isProcessing ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {importMethod === "ai" ? "AI is extracting student data..." : "Parsing file..."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-3">
              <Badge variant="default" className="text-xs">
                <Check className="w-3 h-3 mr-1" />
                {validCount} valid
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {invalidCount} invalid
                </Badge>
              )}
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setParsedStudents([]);
                  setImportMethod(null);
                }}
              >
                Clear & Re-upload
              </Button>
            </div>

            {/* Preview Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Roll</TableHead>
                    <TableHead>Parent Email</TableHead>
                    <TableHead>Transport ₹</TableHead>
                    <TableHead className="w-16">Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedStudents.map((student, i) => (
                    <TableRow key={i} className={!student.valid ? "bg-destructive/5" : ""}>
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium text-sm">
                        {student.first_name} {student.last_name}
                      </TableCell>
                      <TableCell className="text-sm">{student.class}</TableCell>
                      <TableCell className="text-sm">{student.section || "-"}</TableCell>
                      <TableCell className="text-sm">{student.roll_number || "-"}</TableCell>
                      <TableCell className="text-xs">{student.parent_email || "-"}</TableCell>
                      <TableCell className="text-sm">{student.transport_charge || 0}</TableCell>
                      <TableCell>
                        {student.valid ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeStudent(i)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Import Button */}
            <Button
              className="w-full gap-2"
              onClick={handleImport}
              disabled={isImporting || validCount === 0}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import {validCount} Students
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
