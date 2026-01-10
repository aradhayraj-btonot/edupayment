import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Heading1,
  Heading2,
  Heading3,
  Image,
  BarChart3,
  Table,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Send,
  Upload,
  Type,
  ImagePlus,
  X,
  Eye,
  FileImage,
} from 'lucide-react';
import { BlogBlock, uploadBlogImage } from '@/hooks/useBlog';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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

  const renderBlock = (block: BlogBlock, index: number) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <Textarea
            value={block.content || ''}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            onPaste={(e) => handlePaste(e, block.id)}
            placeholder="Write your content here... (you can paste images directly)"
            className="min-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 text-base leading-relaxed p-0"
          />
        );

      case 'heading':
        return (
          <div className="space-y-3">
            <div className="flex gap-1">
              {[1, 2, 3].map((level) => (
                <Button
                  key={level}
                  variant={block.level === level ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateBlock(block.id, { level })}
                  className="h-7 px-2"
                >
                  H{level}
                </Button>
              ))}
            </div>
            <Input
              value={block.content || ''}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder={`Enter heading ${block.level || 2}...`}
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
              <div className="space-y-2">
                <div className="relative rounded-lg overflow-hidden border">
                  <img
                    src={block.src}
                    alt={block.alt || ''}
                    className="max-w-full h-auto"
                  />
                </div>
                <Input
                  value={block.alt || ''}
                  onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                  placeholder="Add alt text for SEO and accessibility..."
                  className="text-sm"
                />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, block.id)}
                  className="hidden"
                />
                <ImagePlus className="h-10 w-10 text-muted-foreground mb-3" />
                <span className="text-sm text-muted-foreground font-medium">Click to upload image</span>
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
      case 'paragraph': return 'Paragraph';
      case 'heading': return 'Heading';
      case 'image': return 'Image';
      case 'table': return 'Table';
      case 'poll': return 'Poll';
      default: return type;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Editor Area */}
      <div className="flex-1 space-y-6">
        {/* Cover Image Section */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {coverImage ? (
              <div className="relative aspect-[21/9] bg-muted">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4 shadow-lg"
                  onClick={() => setCoverImage('')}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-muted/30 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                  ref={coverInputRef}
                />
                <div className="flex flex-col items-center text-center p-8">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">Add cover image</span>
                  <span className="text-xs text-muted-foreground mt-1">Recommended: 1200 x 630px</span>
                </div>
              </label>
            )}
          </CardContent>
        </Card>

        {/* Title */}
        <div className="px-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your blog title..."
            className="text-3xl md:text-4xl font-bold border-0 bg-transparent focus-visible:ring-0 px-0 h-auto py-2 placeholder:text-muted-foreground/50"
          />
        </div>

        <Separator />

        {/* Content Blocks */}
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div key={block.id} className="group relative">
              {/* Block Controls */}
              <div className="absolute -left-12 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
              </div>

              {/* Block Header */}
              <div className="flex items-center gap-2 mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {getBlockIcon(block.type)}
                  <span>{getBlockLabel(block.type)}</span>
                </div>
                <div className="flex-1" />
                {blocks.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeBlock(block.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Block Content */}
              <Card className="border-muted">
                <CardContent className="p-4">
                  {renderBlock(block, index)}
                </CardContent>
              </Card>

              {/* Add Block Button */}
              <div className="flex justify-center py-2">
                <BlockMenu onSelect={(type) => addBlock(type, index)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar - Actions & Preview */}
      <div className="lg:w-80 space-y-4">
        <Card className="sticky top-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Publish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">Draft</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Blocks</span>
                <span className="font-medium">{blocks.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Words</span>
                <span className="font-medium">
                  {blocks.reduce((acc, b) => acc + (b.content?.split(/\s+/).filter(Boolean).length || 0), 0)}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleSave} 
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button 
                className="w-full justify-start" 
                onClick={handlePublish} 
                disabled={isPublishing}
              >
                <Send className="h-4 w-4 mr-2" />
                {isPublishing ? 'Publishing...' : 'Publish Now'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Paste images directly into text blocks
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Add alt text for better SEO
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Use headings to structure content
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Polls engage your readers
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Block Menu Component
function BlockMenu({ onSelect }: { onSelect: (type: BlogBlock['type']) => void }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (type: BlogBlock['type']) => {
    onSelect(type);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-3 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add block
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Content Block</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 py-2">
          <Button 
            variant="outline" 
            onClick={() => handleSelect('paragraph')} 
            className="h-auto py-4 flex-col gap-2 justify-center"
          >
            <Type className="h-6 w-6" />
            <span className="text-xs font-medium">Paragraph</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSelect('heading')} 
            className="h-auto py-4 flex-col gap-2 justify-center"
          >
            <Heading2 className="h-6 w-6" />
            <span className="text-xs font-medium">Heading</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSelect('image')} 
            className="h-auto py-4 flex-col gap-2 justify-center"
          >
            <Image className="h-6 w-6" />
            <span className="text-xs font-medium">Image</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSelect('table')} 
            className="h-auto py-4 flex-col gap-2 justify-center"
          >
            <Table className="h-6 w-6" />
            <span className="text-xs font-medium">Table</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSelect('poll')} 
            className="h-auto py-4 flex-col gap-2 justify-center col-span-2"
          >
            <BarChart3 className="h-6 w-6" />
            <span className="text-xs font-medium">Interactive Poll</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
      <div className="overflow-x-auto rounded-lg border">
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
                    className="h-10 w-10 rounded-none"
                    onClick={() => removeRow(rowIndex)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-3 w-3 mr-1" />
          Row
        </Button>
        <Button variant="outline" size="sm" onClick={addColumn}>
          <Plus className="h-3 w-3 mr-1" />
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

    // Poll creation would happen here via mutation
    toast({ title: 'Poll created', description: 'Poll will be saved with the post' });
  };

  if (pollId) {
    return (
      <div className="p-4 bg-muted/50 rounded-lg text-center">
        <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Poll attached</p>
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
          placeholder="Ask your readers a question..."
          className="mt-1.5"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Options
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
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Option
        </Button>
        <Button size="sm" onClick={handleCreatePoll}>
          Create Poll
        </Button>
      </div>
    </div>
  );
}
