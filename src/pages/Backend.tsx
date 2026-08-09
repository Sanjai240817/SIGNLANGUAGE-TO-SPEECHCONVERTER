import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  History, 
  Clock, 
  Activity, 
  Trash2, 
  Download,
  ChevronRight,
  Hand,
  Mic,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fetchSessions, fetchGestureLogs, fetchTranscripts } from '@/lib/backendApi';

interface GestureSession {
  id: string;
  session_name: string | null;
  started_at: string;
  ended_at: string | null;
  total_gestures: number | null;
}

interface GestureLog {
  id: string;
  session_id: string | null;
  gesture_name: string;
  gesture_description: string | null;
  confidence: number | null;
  detected_at: string;
}

interface SpeechTranscript {
  id: string;
  session_id: string | null;
  original_text: string;
  converted_signs: string[] | null;
  created_at: string;
}

const BackendDashboard = () => {
  const [sessions, setSessions] = useState<GestureSession[]>([]);
  const [gestureLogs, setGestureLogs] = useState<GestureLog[]>([]);
  const [transcripts, setTranscripts] = useState<SpeechTranscript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions');
  const { toast } = useToast();

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sessionsData, logsData, transcriptsData] = await Promise.all([
        fetchSessions(),
        fetchGestureLogs(),
        fetchTranscripts(),
      ]);

      setSessions(sessionsData || []);
      setGestureLogs(logsData || []);
      setTranscripts(transcriptsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data from the backend.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    {
      label: 'Total Sessions',
      value: sessions.length,
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Gestures Logged',
      value: gestureLogs.length,
      icon: Hand,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Transcripts',
      value: transcripts.length,
      icon: Mic,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Avg Confidence',
      value: gestureLogs.length > 0 
        ? `${Math.round(gestureLogs.reduce((sum, log) => sum + (log.confidence || 0), 0) / gestureLogs.length)}%`
        : '0%',
      icon: BarChart3,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl gradient-bg-primary shadow-glow">
              <Database className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Backend Dashboard</h1>
              <p className="text-muted-foreground">Manage your sessions, gestures, and transcripts</p>
            </div>
          </div>
          
          <Button onClick={fetchData} variant="outline" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <Card key={stat.label} className="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Data Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="sessions" className="gap-2">
              <Activity className="w-4 h-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="gestures" className="gap-2">
              <Hand className="w-4 h-4" />
              Gestures
            </TabsTrigger>
            <TabsTrigger value="transcripts" className="gap-2">
              <Mic className="w-4 h-4" />
              Transcripts
            </TabsTrigger>
          </TabsList>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>View and manage your gesture recording sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No sessions yet. Start translating to create one!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${session.ended_at ? 'bg-success/10' : 'bg-warning/10'}`}>
                            {session.ended_at ? (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-warning" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {session.session_name || 'Unnamed Session'}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(session.started_at), 'MMM d, yyyy HH:mm')}
                              </span>
                              <span>•</span>
                              <span>{session.total_gestures || 0} gestures</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={session.ended_at ? 'secondary' : 'default'}>
                          {session.ended_at ? 'Completed' : 'Active'}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestures Tab */}
          <TabsContent value="gestures">
            <Card>
              <CardHeader>
                <CardTitle>Gesture Logs</CardTitle>
                <CardDescription>All detected gestures with confidence scores</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : gestureLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Hand className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No gestures logged yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {gestureLogs.slice(0, 30).map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="p-4 rounded-xl bg-muted/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold gradient-text">{log.gesture_name}</span>
                          <Badge variant="outline">{log.confidence || 0}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {log.gesture_description || 'No description'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.detected_at), 'HH:mm:ss')}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transcripts Tab */}
          <TabsContent value="transcripts">
            <Card>
              <CardHeader>
                <CardTitle>Speech Transcripts</CardTitle>
                <CardDescription>Saved speech-to-sign conversions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : transcripts.length === 0 ? (
                  <div className="text-center py-12">
                    <Mic className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No transcripts saved yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transcripts.map((transcript, index) => (
                      <motion.div
                        key={transcript.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-muted/50"
                      >
                        <p className="font-medium text-foreground mb-2">"{transcript.original_text}"</p>
                        {transcript.converted_signs && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {transcript.converted_signs.slice(0, 20).map((sign, i) => (
                              <span 
                                key={i} 
                                className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs"
                              >
                                {sign}
                              </span>
                            ))}
                            {transcript.converted_signs.length > 20 && (
                              <span className="text-xs text-muted-foreground">
                                +{transcript.converted_signs.length - 20} more
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transcript.created_at), 'MMM d, yyyy HH:mm:ss')}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BackendDashboard;
