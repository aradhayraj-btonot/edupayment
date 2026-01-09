import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Bold,
  Italic,
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
} from 'lucide-react';
import { BlogBlock, uploadBlogImage } from '@/hooks/useBlog';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [activeBlockForImage, setActiveBlockForImage] = useState<string | null>(null);

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

              // Insert image block after current block
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
            placeholder="Start writing... (paste images directly)"
            className="min-h-[100px] resize-none border-none focus-visible:ring-0 text-base"
          />
        );

      case 'heading':
        const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
        return (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[1, 2, 3].map((level) => (
                <Button
                  key={level}
                  variant={block.level === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateBlock(block.id, { level })}
                >
                  H{level}
                </Button>
              ))}
            </div>
            <Input
              value={block.content || ''}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder={`Heading ${block.level || 2}`}
              className={`border-none focus-visible:ring-0 font-bold ${
                block.level === 1 ? 'text-3xl' : block.level === 2 ? 'text-2xl' : 'text-xl'
              }`}
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            {block.src ? (
              <div className="relative">
                <img
                  src={block.src}
                  alt={block.alt || ''}
                  className="max-w-full rounded-lg"
                />
                <Input
                  value={block.alt || ''}
                  onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                  placeholder="Image alt text (for SEO)"
                  className="mt-2"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, block.id)}
                  className="hidden"
                  id={`image-upload-${block.id}`}
                />
                <label
                  htmlFor={`image-upload-${block.id}`}
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload or paste an image
                  </span>
                </label>
              </div>
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

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="relative">
        {coverImage ? (
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setCoverImage('')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
              ref={coverInputRef}
            />
            <Button
              variant="outline"
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
            >
              <Image className="h-4 w-4 mr-2" />
              {isUploadingCover ? 'Uploading...' : 'Add Cover Image'}
            </Button>
          </div>
        )}
      </div>

      {/* Title */}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Blog post title..."
        className="text-3xl font-bold border-none focus-visible:ring-0 px-0"
      />

      {/* Blocks */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <Card key={block.id} className="relative group">
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
            </div>
            <CardContent className="p-4">
              {renderBlock(block, index)}
            </CardContent>
            <div className="absolute -right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeBlock(block.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <BlockMenu onSelect={(type) => addBlock(type, index)} />
            </div>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 sticky bottom-4 bg-background/80 backdrop-blur p-4 rounded-lg border">
        <Button variant="outline" onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button onClick={handlePublish} disabled={isPublishing}>
          <Send className="h-4 w-4 mr-2" />
          {isPublishing ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}

// Block Menu Component
function BlockMenu({ onSelect }: { onSelect: (type: BlogBlock['type']) => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Add Block</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => onSelect('paragraph')} className="justify-start">
            <span className="mr-2">¶</span> Paragraph
          </Button>
          <Button variant="outline" onClick={() => onSelect('heading')} className="justify-start">
            <Heading2 className="h-4 w-4 mr-2" /> Heading
          </Button>
          <Button variant="outline" onClick={() => onSelect('image')} className="justify-start">
            <Image className="h-4 w-4 mr-2" /> Image
          </Button>
          <Button variant="outline" onClick={() => onSelect('table')} className="justify-start">
            <Table className="h-4 w-4 mr-2" /> Table
          </Button>
          <Button variant="outline" onClick={() => onSelect('poll')} className="justify-start col-span-2">
            <BarChart3 className="h-4 w-4 mr-2" /> Poll
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

  const removeColumn = (index: number) => {
    if ((rows[0]?.length || 0) > 1) {
      onChange(rows.map((row) => row.filter((_, i) => i !== index)));
    }
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border p-1">
                    <Input
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="border-none h-8 text-sm"
                      placeholder={rowIndex === 0 ? 'Header' : 'Cell'}
                    />
                  </td>
                ))}
                <td className="p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeRow(rowIndex)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addRow}>
          + Row
        </Button>
        <Button variant="outline" size="sm" onClick={addColumn}>
          + Column
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

    // This will be handled by the parent component
    toast({ title: 'Poll created', description: 'Poll will be saved with the post' });
  };

  if (pollId) {
    return (
      <div className="p-4 bg-secondary/50 rounded-lg">
        <p className="text-sm text-muted-foreground">Poll attached (ID: {pollId})</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-secondary/50 rounded-lg">
      <Input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Poll question..."
        className="font-medium"
      />
      <div className="space-y-2">
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
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setOptions([...options, ''])}>
          + Add Option
        </Button>
      </div>
    </div>
  );
}
