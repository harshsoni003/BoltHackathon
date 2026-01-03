import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Phone, PhoneOff, Clock, AlertCircle, Play, Trash2, MessageSquare, Star, RefreshCw, MoreVertical, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, Variants } from 'framer-motion';
import {
  fetchElevenLabsConvAIHistory,
  downloadHistoryItemAudio,
  uploadAudioToSupabase,
  convertToConvAICallHistory,
  CallHistoryItem,
  ConvAIHistoryResponse
} from '@/services/elevenlabs';
import { saveCallLog, deleteCallLog } from '@/services/callLogs';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CallDetailsSidePanel from './CallDetailsSidePanel';

// Fallback call history data if API fails
const fallbackCallHistory = [
  {
    id: '1',
    client: 'Customer Service Agent',
    agent_name: 'Customer Service Agent',
    email: '',
    phone: '',
    date: '2024-06-04',
    time: '14:30',
    duration: '12:45',
    type: 'ConvAI',
    status: 'completed',
    notes: 'Sample conversation with customer about product inquiry',
    messages_count: 12,
    evaluation_result: 'Good'
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <div className="p-1.5 bg-green-100 rounded-lg"><Phone className="h-3.5 w-3.5 text-green-600" /></div>;
    case 'ongoing':
      return <div className="p-1.5 bg-blue-100 rounded-lg"><Clock className="h-3.5 w-3.5 text-blue-600" /></div>;
    case 'missed':
      return <div className="p-1.5 bg-red-100 rounded-lg"><PhoneOff className="h-3.5 w-3.5 text-red-600" /></div>;
    default:
      return <div className="p-1.5 bg-gray-100 rounded-lg"><Phone className="h-3.5 w-3.5 text-gray-600" /></div>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
    case 'ongoing':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Ongoing</Badge>;
    case 'missed':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Missed</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Unknown</Badge>;
  }
};

const getEvaluationBadge = (evaluation: string | undefined) => {
  if (!evaluation) return null;

  const lowerEval = evaluation.toLowerCase();

  if (lowerEval.includes('good') || lowerEval.includes('excellent')) {
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{evaluation}</Badge>;
  } else if (lowerEval.includes('average') || lowerEval.includes('ok')) {
    return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">{evaluation}</Badge>;
  } else if (lowerEval.includes('poor') || lowerEval.includes('bad')) {
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{evaluation}</Badge>;
  } else {
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{evaluation}</Badge>;
  }
};

const CallsContent = () => {
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [callToDelete, setCallToDelete] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<CallHistoryItem | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const { toast } = useToast();

  // Fetch call history from ElevenLabs
  const fetchCallHistory = async (cursor?: string, forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching call history for CallsContent:', { cursor, forceRefresh });

      const response = await fetchElevenLabsConvAIHistory(100, cursor);

      if (!response || !response.conversations) {
        throw new Error('No conversation data received from ElevenLabs');
      }

      const conversations = response.conversations;
      console.log('📊 CallsContent received conversations:', {
        count: conversations.length,
        hasMore: response.has_more,
        cursor: response.next_cursor,
      });

      if (conversations.length === 0) {
        if (!cursor) {
          setError('No conversations found. You may not have any calls or conversations yet.');
        }
        setLoading(false);
        return;
      }

      const convertedCalls = convertToConvAICallHistory(conversations);
      const filteredCalls = convertedCalls;

      if (cursor) {
        setCallHistory(prev => [...prev, ...filteredCalls]);
      } else {
        setCallHistory(filteredCalls);
      }

      setHasMore(response.has_more);
      setNextCursor(response.next_cursor);

      if (!forceRefresh) {
        for (const call of filteredCalls) {
          try {
            await saveCallLog(call);
          } catch (saveError) {
            console.warn('Failed to save call log:', call.id, saveError);
          }
        }
      }

      toast({
        title: "History loaded",
        description: `Loaded ${filteredCalls.length} items from ElevenLabs`,
      });

    } catch (err) {
      console.error('Error fetching call history:', err);

      const errorMessage = err instanceof Error ? err.message : 'Failed to load history';
      setError(errorMessage);

      if (!cursor && errorMessage.includes('API key')) {
        console.log('Using fallback data due to missing API key');
        setCallHistory(fallbackCallHistory);
      }

      toast({
        title: "Error loading history",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForceRefresh = () => {
    console.log('🔄 Force refreshing call history...');
    setCallHistory([]);
    setNextCursor(undefined);
    setHasMore(false);
    fetchCallHistory(undefined, true);
  };

  const handleLoadMore = () => {
    if (nextCursor) {
      fetchCallHistory(nextCursor);
    }
  };

  const handlePlayAudio = async (historyItemId: string) => {
    try {
      toast({
        title: "Loading audio",
        description: "Checking for audio availability...",
      });

      const audioBlob = await downloadHistoryItemAudio(historyItemId);

      if (!audioBlob) {
        toast({
          title: "No audio available",
          description: "This conversation doesn't have downloadable audio.",
          variant: "default",
        });
        return;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onloadstart = () => {
        toast({
          title: "Audio ready",
          description: "Playing conversation audio...",
        });
      };

      audio.onerror = () => {
        toast({
          title: "Audio playback error",
          description: "Failed to play the audio file.",
          variant: "destructive",
        });
      };

      await audio.play();

      const url = await uploadAudioToSupabase(historyItemId, audioBlob);

      if (url) {
        setCallHistory(prev =>
          prev.map(call =>
            call.id === historyItemId ? { ...call, audio_url: url } : call
          )
        );
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      toast({
        title: "Audio unavailable",
        description: "This conversation type may not support audio playback.",
        variant: "default",
      });
    }
  };

  const handleDeleteCall = async () => {
    if (!callToDelete) return;

    try {
      setLoading(true);

      const success = await deleteCallLog(callToDelete);

      if (success) {
        setCallHistory(prev => prev.filter(call => call.id !== callToDelete));

        toast({
          title: "Item deleted",
          description: "History item has been deleted successfully",
        });
      } else {
        throw new Error('Failed to delete history item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      toast({
        title: "Error deleting item",
        description: err instanceof Error ? err.message : 'Failed to delete history item',
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCallToDelete(null);
      setLoading(false);
    }
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    if (value === 'ConvAI') {
      setCallHistory(prev => prev.filter(call => call.type === 'ConvAI'));
    } else {
      fetchCallHistory();
    }
  };

  const handleRowClick = (call: CallHistoryItem) => {
    setSelectedCall(call);
    setSidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setSidePanelOpen(false);
    setSelectedCall(null);
  };

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const filteredCalls = callHistory.filter(call => {
    const matchesSearch = call.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (call.email && call.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      call.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    const matchesType = typeFilter === 'all' || call.type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const hasConvAIItems = callHistory.some(call => call.type === 'ConvAI');

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
      },
    },
  };

  return (
    <>
      <CallDetailsSidePanel
        call={selectedCall}
        isOpen={sidePanelOpen}
        onClose={handleCloseSidePanel}
        onPlayAudio={handlePlayAudio}
      />

      <div className={`min-h-screen bg-gray-50 p-6 space-y-6 transition-all duration-300 ${sidePanelOpen ? 'mr-[800px]' : ''}`}>
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Call History</h1>
            <p className="text-gray-600 mt-1">Manage and review your voice conversations</p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
            onClick={handleForceRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-3"
        >
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Calls</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{callHistory.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {callHistory.filter(c => c.status === 'completed').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Messages</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.round(callHistory.reduce((acc, c) => acc + (c.messages_count || 0), 0) / (callHistory.length || 1))}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search calls..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ConvAI">Conversational AI</SelectItem>
                    <SelectItem value="TTS">Text to Speech</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call History Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {loading && callHistory.length === 0 ? (
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading call history...</p>
              </CardContent>
            </Card>
          ) : filteredCalls.length === 0 ? (
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No calls found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredCalls.map((call, index) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => handleRowClick(call)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {getStatusIcon(call.status)}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {call.agent_name || call.client}
                            </h3>
                            {getStatusBadge(call.status)}
                            <Badge variant="outline" className="text-xs">{call.type}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {call.date} {call.time}
                            </span>
                            <span>Duration: {call.duration}</span>
                            {call.messages_count && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3.5 w-3.5" />
                                {call.messages_count} messages
                              </span>
                            )}
                            {call.evaluation_result && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 text-yellow-500" />
                                {getEvaluationBadge(call.evaluation_result)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {call.audio_url ? (
                          <audio
                            controls
                            src={call.audio_url}
                            className="h-8"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayAudio(call.id);
                            }}
                          >
                            <Play className="h-4 w-4 mr-1" /> Play
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(call);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-800 hover:bg-red-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCallToDelete(call.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}

          {hasMore && !loading && (
            <div className="text-center pt-4">
              <Button onClick={handleLoadMore} variant="outline" size="lg">
                Load More Calls
              </Button>
            </div>
          )}
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Call Record</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this call record? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCall}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default CallsContent;
