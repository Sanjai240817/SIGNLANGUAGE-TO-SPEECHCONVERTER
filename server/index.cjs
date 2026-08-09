const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('Supabase credentials were not found. API routes will respond with a 503 until SUPABASE_URL and a key are configured.');
}

function requireSupabase(req, res, next) {
  if (!supabase) {
    return res.status(503).json({
      error: 'Supabase is not configured. Set SUPABASE_URL and a Supabase key in the environment before using the API.',
    });
  }

  next();
}

app.use('/api', requireSupabase);

app.post('/api/sessions', async (req, res) => {
  try {
    const { session_name } = req.body;
    const { data, error } = await supabase
      .from('gesture_sessions')
      .insert({ session_name })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: error.message || 'Failed to create session' });
  }
});

app.put('/api/sessions/:id/end', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { total_gestures } = req.body;
    const { data, error } = await supabase
      .from('gesture_sessions')
      .update({ ended_at: new Date().toISOString(), total_gestures })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: error.message || 'Failed to end session' });
  }
});

app.post('/api/gestures', async (req, res) => {
  try {
    const { session_id, gesture_name, gesture_description, confidence } = req.body;
    const { data, error } = await supabase
      .from('gesture_logs')
      .insert({ session_id, gesture_name, gesture_description, confidence })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create gesture log error:', error);
    res.status(500).json({ error: error.message || 'Failed to log gesture' });
  }
});

app.post('/api/transcripts', async (req, res) => {
  try {
    const { session_id, original_text, converted_signs } = req.body;
    const { data, error } = await supabase
      .from('speech_transcripts')
      .insert({ session_id, original_text, converted_signs })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create transcript error:', error);
    res.status(500).json({ error: error.message || 'Failed to save transcript' });
  }
});

app.get('/api/sessions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gesture_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Fetch sessions error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch sessions' });
  }
});

app.get('/api/gestures', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gesture_logs')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Fetch gestures error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch gesture logs' });
  }
});

app.get('/api/transcripts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('speech_transcripts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Fetch transcripts error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch transcripts' });
  }
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }

  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`App server listening on http://localhost:${port}`);
});
