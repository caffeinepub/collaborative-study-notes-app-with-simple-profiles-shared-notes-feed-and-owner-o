import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NoteCard from './NoteCard';
import NoteReaderSheet from './NoteReaderSheet';
import NoteForm from './NoteForm';
import { LoadingState, EmptyState, ErrorState } from './Feedback';
import { useListNotes } from '../hooks/useNotes';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useResumeRefresh } from '../hooks/useResumeRefresh';
import { normalizeError } from '../lib/errors';
import { Plus, Search } from 'lucide-react';
import type { Note } from '../backend';

const INITIAL_DISPLAY_COUNT = 20;
const LOAD_MORE_COUNT = 20;

export default function NotesFeed() {
  const { data: notes = [], isLoading, error, refetch } = useListNotes();
  const { data: userProfile } = useGetCallerUserProfile();
  
  const [selectedNoteId, setSelectedNoteId] = useState<bigint | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);

  // Enable resume/bfcache refresh
  useResumeRefresh(selectedNoteId);

  // Sort notes: pinned first, then starred, then by question number
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
      return a.questionNo.localeCompare(b.questionNo, undefined, { numeric: true });
    });
  }, [notes]);

  // Filter notes by search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return sortedNotes;
    
    const query = searchQuery.toLowerCase();
    return sortedNotes.filter(note => 
      note.questionNo.toLowerCase().includes(query) ||
      note.questionText.toLowerCase().includes(query) ||
      note.answer.toLowerCase().includes(query) ||
      note.author.toLowerCase().includes(query) ||
      note.college.toLowerCase().includes(query) ||
      note.year.toLowerCase().includes(query)
    );
  }, [sortedNotes, searchQuery]);

  // Paginate notes
  const displayedNotes = useMemo(() => {
    return filteredNotes.slice(0, displayCount);
  }, [filteredNotes, displayCount]);

  const hasMore = displayCount < filteredNotes.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + LOAD_MORE_COUNT);
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setShowNoteForm(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowNoteForm(true);
  };

  if (isLoading) {
    return <LoadingState message="Loading notes..." />;
  }

  if (error) {
    return <ErrorState message={normalizeError(error)} onRetry={refetch} />;
  }

  if (!userProfile) {
    return <EmptyState title="Please set up your profile to view notes" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes by question, answer, author, or college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleCreateNote} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Create Note
        </Button>
      </div>

      {filteredNotes.length === 0 ? (
        <EmptyState 
          title={searchQuery ? 'No notes match your search' : 'No notes yet. Create your first note!'} 
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayedNotes.map((note) => (
              <NoteCard
                key={note.id.toString()}
                note={note}
                onClick={() => setSelectedNoteId(note.id)}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleLoadMore}>
                Load More ({filteredNotes.length - displayCount} remaining)
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground pt-2">
            Showing {displayedNotes.length} of {filteredNotes.length} notes
            {searchQuery && ` (filtered from ${notes.length} total)`}
          </div>
        </>
      )}

      <NoteReaderSheet
        noteId={selectedNoteId}
        onClose={() => setSelectedNoteId(null)}
        onEdit={handleEditNote}
      />

      <NoteForm
        open={showNoteForm}
        onOpenChange={setShowNoteForm}
        existingNote={editingNote}
        authorName={userProfile.name}
        collegeName={userProfile.college}
      />
    </div>
  );
}
