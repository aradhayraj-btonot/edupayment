import { useState, useEffect } from 'react';
import { BlogBlock, BlogPoll, useBlogMutations } from '@/hooks/useBlog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BlogRendererProps {
  content: BlogBlock[];
  postId?: string;
}

export function BlogRenderer({ content, postId }: BlogRendererProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {content.map((block) => (
        <BlockRenderer key={block.id} block={block} postId={postId} />
      ))}
    </div>
  );
}

function BlockRenderer({ block, postId }: { block: BlogBlock; postId?: string }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="whitespace-pre-wrap">{block.content}</p>;

    case 'heading':
      const Tag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
      return <Tag>{block.content}</Tag>;

    case 'image':
      return (
        <figure className="my-6">
          <img
            src={block.src}
            alt={block.alt || ''}
            className="rounded-lg w-full"
            loading="lazy"
          />
          {block.alt && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {block.alt}
            </figcaption>
          )}
        </figure>
      );

    case 'table':
      if (!block.rows || block.rows.length === 0) return null;
      return (
        <div className="overflow-x-auto my-6">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted">
                {block.rows[0]?.map((cell, i) => (
                  <th key={i} className="border border-border p-2 text-left font-semibold">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.slice(1).map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-border p-2">
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
    <div className="my-6 p-6 bg-secondary/50 rounded-lg not-prose">
      <h4 className="font-semibold text-lg mb-4">{poll.question}</h4>
      <div className="space-y-3">
        {poll.options.map((option, index) => {
          const voteCount = votes[index] || 0;
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-3">
                {!hasVoted && (
                  <input
                    type="radio"
                    name={`poll-${pollId}`}
                    checked={selectedOption === index}
                    onChange={() => setSelectedOption(index)}
                    className="h-4 w-4"
                  />
                )}
                <span className="flex-1">{option.text}</span>
                {hasVoted && (
                  <span className="text-sm text-muted-foreground">
                    {voteCount} ({percentage.toFixed(0)}%)
                  </span>
                )}
              </div>
              {hasVoted && (
                <Progress value={percentage} className="h-2" />
              )}
            </div>
          );
        })}
      </div>
      {!hasVoted && (
        <Button
          onClick={handleVote}
          disabled={selectedOption === null || isVoting}
          className="mt-4"
        >
          {isVoting ? 'Voting...' : 'Submit Vote'}
        </Button>
      )}
      {hasVoted && (
        <p className="text-sm text-muted-foreground mt-3">
          Total votes: {totalVotes}
        </p>
      )}
    </div>
  );
}
