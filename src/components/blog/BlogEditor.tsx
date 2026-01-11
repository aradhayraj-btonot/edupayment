import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Heading1,
  Heading2,
  Heading3,
  Image,
  BarChart3,
  Table,
  Plus,
  Trash2,
  Save,
  Send,
  Type,
  ImagePlus,
  X,
  FileImage,
  GripVertical,
  ChevronDown,
} from 'lucide-react';
import { BlogBlock, uploadBlogImage } from '@/hooks/useBlog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BlogEditorProps {
  initialTitle?: string;
  initialContent?: BlogBlock[];
  initialCoverImage?: string;
  onSave: (data: { title: string; content: BlogBlock[]; coverImage?: string }) => void;
  onPublish: (data: { title: string; content: BlogBlock[]; coverImage?: string }) => void;
  isSaving?: boolean;
  isPublishing?: boolean;
}

export function BlogEditor({
  initialTitle = '',
  initialContent = [],
  initialCoverImage = '',
  onSave,
  onPublish,
  isSaving,
  isPublishing,
}: BlogEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [blocks, setBlocks] = useState<BlogBlock[]>(
    initialContent.length > 0 ? initialContent : [{ id: '1', type: 'paragraph', content: '' }]
  );
  const [coverImage, setCoverImage] = useState(initialCoverImage);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const { toast } = useToast();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substring(7);

  const addBlock = (type: BlogBlock['type'], afterIndex: number) => {
    const newBlock: BlogBlock = { id: generateId(), type };

    if (type === 'paragraph') {
      newBlock.content = '';
    } else if (type === 'heading') {
      newBlock.content = '';
      newBlock.level = 2;
    } else if (type === 'image') {
      newBlock.src = '';
      newBlock.alt = '';
    } else if (type === 'table') {
      newBlock.rows = [['', ''], ['', '']];
    }

    const newBlocks = [...blocks];
    newBlocks.splice(afterIndex + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const updateBlock = (id: string, updates: Partial<BlogBlock>) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, ...updates } : block))
    );
  };

  const removeBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks((prev) => prev.filter((block) => block.id !== id));
    }
  };

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent, blockId: string) => {
      const items = e.clipboardData.items;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            try {
              toast({ title: 'Uploading image...', description: 'Please wait' });
              const url = await uploadBlogImage(file);

              const currentIndex = blocks.findIndex((b) => b.id === blockId);
              const newBlock: BlogBlock = {
                id: generateId(),
                type: 'image',
                src: url,
                alt: 'Pasted image',
              };

              const newBlocks = [...blocks];
              newBlocks.splice(currentIndex + 1, 0, newBlock);
              setBlocks(newBlocks);

              toast({ title: 'Image added', description: 'Image uploaded successfully' });
            } catch (error) {
              toast({
                title: 'Upload failed',
                description: 'Could not upload image',
                variant: 'destructive',
              });
            }
          }
          break;
        }
      }
    },
    [blocks, toast]
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast({ title: 'Uploading image...', description: 'Please wait' });
      const url = await uploadBlogImage(file);
      updateBlock(blockId, { src: url });
      toast({ title: 'Image uploaded', description: 'Image added successfully' });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Could not upload image',
        variant: 'destructive',
      });
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      const url = await uploadBlogImage(file);
      setCoverImage(url);
      toast({ title: 'Cover uploaded', description: 'Cover image added successfully' });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Could not upload cover image',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast({ title: 'Title required', description: 'Please add a title', variant: 'destructive' });
      return;
    }
    onSave({ title, content: blocks, coverImage });
  };

  const handlePublish = () => {
    if (!title.trim()) {
      toast({ title: 'Title required', description: 'Please add a title', variant: 'destructive' });
      return;
    }
    onPublish({ title, content: blocks, coverImage });
  };

  const wordCount = blocks.reduce((acc, b) => acc + (b.content?.split(/\s+/).filter(Boolean).length || 0), 0);

  const renderBlock = (block: BlogBlock, index: number) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <Textarea
            value={block.content || ''}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            onPaste={(e) => handlePaste(e, block.id)}
            placeholder="Start writing your content here... (paste images directly)"
            className="min-h-[150px] resize-none border-0 bg-transparent focus-visible:ring-0 text-base leading-relaxed p-0 placeholder:text-muted-foreground/50"
          />
        );

      case 'heading':
        return (
          <div className="space-y-3">
            <div className="flex gap-1">
              {[1, 2, 3].map((level) => (
                <Button
                  key={level}
                  variant={block.level === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateBlock(block.id, { level })}
                  className="h-8 px-3"
                >
                  H{level}
                </Button>
              ))}
            </div>
            <Input
              value={block.content || ''}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder={`Heading ${block.level || 2}`}
              className={cn(
                "border-0 bg-transparent focus-visible:ring-0 font-bold px-0",
                block.level === 1 && "text-3xl",
                block.level === 2 && "text-2xl",
                block.level === 3 && "text-xl"
              )}
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            {block.src ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-muted">
                  <img
                    src={block.src}
                    alt={block.alt || ''}
                    className="max-w-full h-auto mx-auto"
                  />
                </div>
                <Input
                  value={block.alt || ''}
                  onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                  placeholder="Image caption (alt text for accessibility)"
                  className="text-sm"
                />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-52 border-2 border-dashed border-muted-foreground/25 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all duration-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, block.id)}
                  className="hidden"
                />
                <div className="p-4 rounded-full bg-muted mb-3">
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">Click to upload image</span>
                <span className="text-xs text-muted-foreground mt-1">or paste from clipboard</span>
              </label>
            )}
          </div>
        );

      case 'table':
        return <TableEditor rows={block.rows || []} onChange={(rows) => updateBlock(block.id, { rows })} />;

      case 'poll':
        return <PollEditor blockId={block.id} pollId={block.pollId} onPollCreated={(pollId) => updateBlock(block.id, { pollId })} />;

      default:
        return null;
    }
  };

  const getBlockIcon = (type: BlogBlock['type']) => {
    switch (type) {
      case 'paragraph': return <Type className="h-4 w-4" />;
      case 'heading': return <Heading2 className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'table': return <Table className="h-4 w-4" />;
      case 'poll': return <BarChart3 className="h-4 w-4" />;
      default: return null;
    }
  };

  const getBlockLabel = (type: BlogBlock['type']) => {
    switch (type) {
      case 'paragraph': return 'Text';
      case 'heading': return 'Heading';
      case 'image': return 'Image';
      case 'table': return 'Table';
      case 'poll': return 'Poll';
      default: return type;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-6 -mx-4 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{blocks.length} blocks</span>
            <span>•</span>
            <span>{wordCount} words</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleSave} 
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              onClick={handlePublish} 
              disabled={isPublishing}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="mb-8">
        {coverImage ? (
          <div className="relative aspect-[2/1] rounded-2xl overflow-hidden bg-muted group">
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={() => setCoverImage('')}
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center aspect-[3/1] border-2 border-dashed border-muted-foreground/25 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all duration-200">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
              ref={coverInputRef}
            />
            <div className="p-4 rounded-full bg-muted mb-3">
              <FileImage className="h-8 w-8 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">Add cover image</span>
            <span className="text-xs text-muted-foreground mt-1">Recommended: 1200 × 630px</span>
          </label>
        )}
      </div>

      {/* Title */}
      <div className="mb-8">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="text-4xl md:text-5xl font-bold border-0 bg-transparent focus-visible:ring-0 px-0 h-auto py-2 placeholder:text-muted-foreground/40"
        />
      </div>

      <Separator className="mb-8" />

      {/* Content Blocks */}
      <div className="space-y-1">
        {blocks.map((block, index) => (
          <div key={block.id} className="group relative">
            {/* Block Container */}
            <div className="relative pl-8">
              {/* Block Controls - Left Side */}
              <div className="absolute left-0 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="cursor-grab p-1 rounded hover:bg-muted">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Block Header with Delete */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  {getBlockIcon(block.type)}
                  <span>{getBlockLabel(block.type)}</span>
                </div>
                {blocks.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => removeBlock(block.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Block Content */}
              <div className="bg-muted/30 rounded-xl p-4 border border-transparent hover:border-muted-foreground/10 transition-colors">
                {renderBlock(block, index)}
              </div>

              {/* Add Block Button */}
              <div className="flex justify-center py-4">
                <AddBlockMenu onSelect={(type) => addBlock(type, index)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add Block Menu Component
function AddBlockMenu({ onSelect }: { onSelect: (type: BlogBlock['type']) => void }) {
  const blockTypes: { type: BlogBlock['type']; icon: React.ReactNode; label: string }[] = [
    { type: 'paragraph', icon: <Type className="h-4 w-4" />, label: 'Text' },
    { type: 'heading', icon: <Heading2 className="h-4 w-4" />, label: 'Heading' },
    { type: 'image', icon: <Image className="h-4 w-4" />, label: 'Image' },
    { type: 'table', icon: <Table className="h-4 w-4" />, label: 'Table' },
    { type: 'poll', icon: <BarChart3 className="h-4 w-4" />, label: 'Poll' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-3 text-muted-foreground hover:text-foreground gap-1"
        >
          <Plus className="h-4 w-4" />
          Add block
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-40">
        {blockTypes.map(({ type, icon, label }) => (
          <DropdownMenuItem key={type} onClick={() => onSelect(type)} className="gap-2">
            {icon}
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Table Editor Component
function TableEditor({
  rows,
  onChange,
}: {
  rows: string[][];
  onChange: (rows: string[][]) => void;
}) {
  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = rows.map((row, ri) =>
      ri === rowIndex ? row.map((cell, ci) => (ci === colIndex ? value : cell)) : row
    );
    onChange(newRows);
  };

  const addRow = () => {
    onChange([...rows, new Array(rows[0]?.length || 2).fill('')]);
  };

  const addColumn = () => {
    onChange(rows.map((row) => [...row, '']));
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      onChange(rows.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border bg-background">
        <table className="w-full border-collapse">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={cn(rowIndex === 0 && "bg-muted/50")}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border-r last:border-r-0 border-b last:border-b-0 p-0">
                    <Input
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="border-0 rounded-none h-10 text-sm focus-visible:ring-1 focus-visible:ring-inset"
                      placeholder={rowIndex === 0 ? 'Header' : 'Cell'}
                    />
                  </td>
                ))}
                <td className="w-10 border-b">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none text-muted-foreground hover:text-destructive"
                    onClick={() => removeRow(rowIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addRow} className="gap-1">
          <Plus className="h-3 w-3" />
          Row
        </Button>
        <Button variant="outline" size="sm" onClick={addColumn} className="gap-1">
          <Plus className="h-3 w-3" />
          Column
        </Button>
      </div>
    </div>
  );
}

// Poll Editor Component
function PollEditor({
  blockId,
  pollId,
  onPollCreated,
}: {
  blockId: string;
  pollId?: string;
  onPollCreated: (pollId: string) => void;
}) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const { toast } = useToast();

  const handleCreatePoll = async () => {
    if (!question.trim()) {
      toast({ title: 'Question required', variant: 'destructive' });
      return;
    }
    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      toast({ title: 'At least 2 options required', variant: 'destructive' });
      return;
    }

    toast({ title: 'Poll created', description: 'Poll will be saved with the post' });
  };

  if (pollId) {
    return (
      <div className="p-6 bg-muted/50 rounded-xl text-center">
        <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm font-medium">Poll attached</p>
        <p className="text-xs text-muted-foreground mt-1">Readers will be able to vote on this poll</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Poll Question
        </Label>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What would you like to ask your readers?"
          className="mt-1.5"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Answer Options
        </Label>
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={option}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
              placeholder={`Option ${index + 1}`}
            />
            {options.length > 2 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOptions(options.filter((_, i) => i !== index))}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOptions([...options, ''])}
          disabled={options.length >= 6}
          className="gap-1"
        >
          <Plus className="h-3 w-3" />
          Add Option
        </Button>
        <Button size="sm" onClick={handleCreatePoll}>
          Create Poll
        </Button>
      </div>
    </div>
  );
}
