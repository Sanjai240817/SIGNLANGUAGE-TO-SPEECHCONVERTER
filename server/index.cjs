const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();

// ===============================
// Middleware
// ===============================

app.use(
  cors({
    origin: '*',
  })
);

app.use(express.json());

// ===============================
// Supabase Configuration
// ===============================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
      transport: WebSocket,
    },
  });

  console.log('Supabase connected');
} else {
  console.warn(
    'Supabase credentials were not found. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.'
  );
}

// ===============================
// Supabase Middleware
// ===============================

function requireSupabase(req, res, next) {
  if (!supabase) {
    return res.status(503).json({
      error: 'Supabase is not configured.',
    });
  }

  next();
}

app.use('/api', requireSupabase);

// ===============================
// CREATE SESSION
// ===============================

app.post('/api/sessions', async (req, res) => {
  try {
    const { session_name } = req.body;

    const { data, error } = await supabase
      .from('gesture_sessions')
      .insert({
        session_name,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Create session error:', error);

    res.status(500).json({
      error: error.message || 'Failed to create session',
    });
  }
});

// ===============================
// END SESSION
// ===============================

app.put('/api/sessions/:id/end', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { total_gestures } = req.body;

    const { data, error } = await supabase
      .from('gesture_sessions')
      .update({
        ended_at: new Date().toISOString(),
        total_gestures,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('End session error:', error);

    res.status(500).json({
      error: error.message || 'Failed to end session',
    });
  }
});

// ===============================
// LOG GESTURE
// ===============================

app.post('/api/gestures', async (req, res) => {
  try {
    const {
      session_id,
      gesture_name,
      gesture_description,
      confidence,
    } = req.body;

    const { data, error } = await supabase
      .from('gesture_logs')
      .insert({
        session_id,
        gesture_name,
        gesture_description,
        confidence,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Create gesture log error:', error);

    res.status(500).json({
      error: error.message || 'Failed to log gesture',
    });
  }
});

// ===============================
// SAVE TRANSCRIPT
// ===============================

app.post('/api/transcripts', async (req, res) => {
  try {
    const {
      session_id,
      original_text,
      converted_signs,
    } = req.body;

    const { data, error } = await supabase
      .from('speech_transcripts')
      .insert({
        session_id,
        original_text,
        converted_signs,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Create transcript error:', error);

    res.status(500).json({
      error: error.message || 'Failed to save transcript',
    });
  }
});

// ===============================
// GET SESSIONS
// ===============================

app.get('/api/sessions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gesture_sessions')
      .select('*')
      .order('started_at', {
        ascending: false,
      })
      .limit(100);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Fetch sessions error:', error);

    res.status(500).json({
      error: error.message || 'Failed to fetch sessions',
    });
  }
});

// ===============================
// GET GESTURES
// ===============================

app.get('/api/gestures', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gesture_logs')
      .select('*')
      .order('detected_at', {
        ascending: false,
      })
      .limit(200);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Fetch gestures error:', error);

    res.status(500).json({
      error: error.message || 'Failed to fetch gesture logs',
    });
  }
});

// ===============================
// GET TRANSCRIPTS
// ===============================

app.get('/api/transcripts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('speech_transcripts')
      .select('*')
      .order('created_at', {
        ascending: false,
      })
      .limit(200);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Fetch transcripts error:', error);

    res.status(500).json({
      error: error.message || 'Failed to fetch transcripts',
    });
  }
});

// ===============================
// HEALTH CHECK
// ===============================

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    service: 'SignSpeak AI Backend',
  });
});

// ===============================
// START SERVER
// ===============================

const port = process.env.PORT || 4000;

app.listen(port, '0.0.0.0', () => {
  console.log(`SignSpeak backend running on port ${port}`);
});