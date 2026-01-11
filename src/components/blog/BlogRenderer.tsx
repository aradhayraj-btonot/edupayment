import { useState, useEffect } from 'react';
import { BlogBlock, BlogPoll } from '@/hooks/useBlog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BlogRendererProps {
  content: BlogBlock[];
  postId?: string;
}

export function BlogRenderer({ content, postId }: BlogRendererProps) {
  return (
    <div className="space-y-6">
      {content.map((block) => (
        <BlockRenderer key={block.id} block={block} postId={postId} />
      ))}
    </div>
  );
}

function BlockRenderer({ block, postId }: { block: BlogBlock; postId?: string }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-base md:text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {block.content}
        </p>
      );

    case 'heading':
      const Tag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
      const headingStyles = {
        1: 'text-3xl md:text-4xl font-bold mt-10 mb-4',
        2: 'text-2xl md:text-3xl font-bold mt-8 mb-3',
        3: 'text-xl md:text-2xl font-semibold mt-6 mb-2',
      };
      return (
        <Tag className={headingStyles[block.level as 1 | 2 | 3] || headingStyles[2]}>
          {block.content}
        </Tag>
      );

    case 'image':
      return (
        <figure className="my-8">
          <div className="rounded-xl overflow-hidden bg-muted">
            <img
              src={block.src}
              alt={block.alt || ''}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
          {block.alt && (
            <figcaption className="text-center text-sm text-muted-foreground mt-3 italic">
              {block.alt}
            </figcaption>
          )}
        </figure>
      );

    case 'table':
      if (!block.rows || block.rows.length === 0) return null;
      return (
        <div className="my-8 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                {block.rows[0]?.map((cell, i) => (
                  <th 
                    key={i} 
                    className="px-4 py-3 text-left font-semibold text-sm border-b"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.slice(1).map((row, ri) => (
                <tr key={ri} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-sm">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'poll':
      if (!block.pollId) return null;
      return <PollRenderer pollId={block.pollId} />;

    default:
      return null;
  }
}

function PollRenderer({ pollId }: { pollId: string }) {
  const [poll, setPoll] = useState<BlogPoll | null>(null);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPoll = async () => {
      const { data, error } = await supabase
        .from('blog_polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (data && !error) {
        setPoll(data as BlogPoll);
      }

      // Fetch vote counts
      const { data: voteData } = await supabase
        .from('blog_poll_votes')
        .select('option_index')
        .eq('poll_id', pollId);

      if (voteData) {
        const counts: Record<number, number> = {};
        voteData.forEach((v) => {
          counts[v.option_index] = (counts[v.option_index] || 0) + 1;
        });
        setVotes(counts);
      }

      // Check if current user has voted
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: existingVote } = await supabase
          .from('blog_poll_votes')
          .select('id')
          .eq('poll_id', pollId)
          .eq('voter_id', userData.user.id)
          .single();

        if (existingVote) {
          setHasVoted(true);
        }
      }
    };

    fetchPoll();
  }, [pollId]);

  const handleVote = async () => {
    if (selectedOption === null) return;

    setIsVoting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase.from('blog_poll_votes').insert({
        poll_id: pollId,
        option_index: selectedOption,
        voter_id: userData?.user?.id || null,
      });

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Already voted', description: 'You have already voted in this poll', variant: 'destructive' });
        } else {
          throw error;
        }
      } else {
        setHasVoted(true);
        setVotes((prev) => ({
          ...prev,
          [selectedOption]: (prev[selectedOption] || 0) + 1,
        }));
        toast({ title: 'Vote recorded', description: 'Thank you for voting!' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Could not submit vote', variant: 'destructive' });
    } finally {
      setIsVoting(false);
    }
  };

  if (!poll) return null;

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/10">
      <h4 className="font-semibold text-lg mb-5">{poll.question}</h4>
      <div className="space-y-3">
        {poll.options.map((option, index) => {
          const voteCount = votes[index] || 0;
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

          return (
            <div 
              key={index} 
              className={cn(
                "relative rounded-lg border transition-all",
                !hasVoted && "cursor-pointer hover:border-primary/50",
                !hasVoted && selectedOption === index && "border-primary bg-primary/5"
              )}
              onClick={() => !hasVoted && setSelectedOption(index)}
            >
              <div className="relative z-10 p-4">
                <div className="flex items-center gap-3">
                  {!hasVoted && (
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      selectedOption === index ? "border-primary bg-primary" : "border-muted-foreground/30"
                    )}>
                      {selectedOption === index && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                  )}
                  <span className="flex-1 font-medium">{option.text}</span>
                  {hasVoted && (
                    <span className="text-sm font-semibold text-primary">
                      {percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
                {hasVoted && (
                  <div className="mt-2">
                    <Progress value={percentage} className="h-2" />
                    <span className="text-xs text-muted-foreground mt-1">
                      {voteCount} vote{voteCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!hasVoted && (
        <Button
          onClick={handleVote}
          disabled={selectedOption === null || isVoting}
          className="mt-5 w-full"
        >
          {isVoting ? 'Submitting...' : 'Submit Vote'}
        </Button>
      )}
      {hasVoted && (
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Total votes: {totalVotes}
        </p>
      )}
    </div>
  );
}
