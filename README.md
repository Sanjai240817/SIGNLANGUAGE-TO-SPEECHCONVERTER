#SignSpeak AI#


Sign Language ↔ Speech Converter
SignSpeak AI is an AI-powered communication platform that converts American Sign Language (ASL) hand gestures into speech and converts spoken language into ASL representations.

The application is designed to reduce communication barriers between sign-language users and hearing users through real-time browser-based processing.

Features
Real-time ASL hand gesture detection
ASL alphabet recognition
Sign-to-speech conversion
Speech-to-sign conversion
Real-time camera processing
Speech recognition
Text-to-speech output
Gesture history
Session tracking
Sentence building
Confidence scoring
Local browser-based AI processing
Responsive web interface
Technology Stack
Frontend
React
TypeScript
Vite
Tailwind CSS
Framer Motion
Computer Vision
MediaPipe Hands
Machine Learning
Python
Scikit-learn
Random Forest
ONNX
ONNX Runtime Web
Backend / Database
Supabase
PostgreSQL
Deployment
Vercel


ASL Recognition Pipeline
Webcam ↓ MediaPipe Hands ↓ 21 Hand Landmarks ↓ Landmark Normalization ↓ 63 Numerical Features ↓ Random Forest ONNX Model ↓ ASL Letter Prediction ↓ Sentence Builder ↓ Text-to-Speech

Speech-to-Sign Pipeline
Microphone ↓ Speech Recognition ↓ Text ↓ ASL Alphabet Mapping ↓ ASL Sign Display