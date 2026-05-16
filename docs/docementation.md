# HireMind AI

## Complete Project Documentation

### Cursor Colombo Buildathon 2026

### Track: Audio & Voice AI (ElevenLabs)

---

# 1. Project Overview

## Project Name

HireMind AI

## Tagline

AI-powered voice interview coach that simulates real recruiter conversations and delivers instant performance feedback.

---

## Concept Summary

HireMind AI is a voice-first interview preparation platform where users practice real job interviews with an AI recruiter powered by:

* conversational AI
* realistic voice synthesis
* adaptive questioning
* performance analytics

The system simulates real interview pressure using natural voice interaction instead of text chat.

---

# 2. Problem Statement

Job seekers face:

* lack of interview practice
* anxiety in real interviews
* no personalized feedback
* limited access to mock interviewers
* poor communication skills under pressure

Existing solutions are:

* text-based
* scripted
* not realistic
* not interactive enough

---

# 3. Solution

HireMind AI provides:

* real-time voice interviews
* AI-generated adaptive questions
* realistic recruiter personalities
* resume-based personalization (premium)
* structured feedback and scoring
* interview history tracking

---

# 4. Objectives

## Primary Objective

Build a realistic AI voice interview simulator using ElevenLabs.

## Secondary Objectives

* improve communication skills
* simulate real interview pressure
* provide actionable feedback
* create startup-ready SaaS product

---

# 5. Business Model (Freemium)

## Free Plan

* manual profile entry
* basic interview questions
* limited AI feedback
* standard voice interviewer

## Premium Plan

* resume upload (PDF)
* AI resume parsing
* personalized interviews
* advanced analytics
* downloadable reports
* multiple interviewer personalities
* interview history tracking

---

# 6. Key Features

---

## 6.1 Authentication

* email login
* Google login

Powered by Supabase Auth

---

## 6.2 User Profile System

### Free Users

Manually enter:

* name
* skills
* education
* target role

### Premium Users

Upload resume for AI extraction.

---

## 6.3 Resume Upload & Parsing (Premium)

* PDF upload
* AI extracts:

  * skills
  * experience
  * projects
  * education

---

## 6.4 Voice Interview System (Core Feature)

AI interviewer:

* speaks using ElevenLabs
* listens to user responses
* asks follow-up questions
* adapts based on answers

---

## 6.5 Speech-to-Text

Options:

* Browser SpeechRecognition API (recommended for MVP)
* Whisper API (fallback)

---

## 6.6 AI Interview Engine

Powered by OpenAI:

* generates questions
* evaluates answers
* creates follow-ups
* simulates recruiter personality

---

## 6.7 Feedback System

Outputs:

* communication score
* technical score
* confidence score
* strengths
* weaknesses
* suggestions

---

## 6.8 Interview History

Users can:

* view past interviews
* track progress
* compare scores

---

## 6.9 Premium Analytics Dashboard

Advanced insights:

* speaking pace
* filler words detection
* hesitation analysis
* performance trends

---

## 6.10 Recruiter Personalities (Premium)

* Corporate HR
* Startup Founder
* Technical Lead
* Friendly interviewer
* Stress interviewer

---

# 7. System Architecture

```text id="arch1"
User Voice Input
      ↓
Speech-to-Text (Browser / Whisper)
      ↓
OpenAI Interview Engine
      ↓
Response Generation
      ↓
ElevenLabs Voice Synthesis
      ↓
Audio Playback
      ↓
Supabase Storage
```

---

# 8. User Flow

---

## 8.1 Free User Flow

1. Register/Login
2. Manual profile entry
3. Select job role
4. Start basic interview
5. Receive simple feedback

---

## 8.2 Premium User Flow

1. Register/Login
2. Upload resume
3. AI extracts profile data
4. Personalized interview starts
5. Adaptive questioning
6. Advanced feedback dashboard
7. Download report

---

# 9. Tech Stack

---

## Frontend

* [Next.js](https://nextjs.org?utm_source=chatgpt.com)
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion

---

## Backend

* Next.js API Routes

---

## Database & Auth

* [Supabase](https://supabase.com?utm_source=chatgpt.com)

  * Authentication
  * PostgreSQL database
  * File storage

---

## AI Services

* [OpenAI](https://openai.com?utm_source=chatgpt.com)

  * interview logic
  * evaluation
  * question generation

* [ElevenLabs](https://elevenlabs.io?utm_source=chatgpt.com)

  * voice synthesis
  * recruiter speech

---

## Deployment

* [Vercel](https://vercel.com?utm_source=chatgpt.com)

---

# 10. Database Schema

---

## users

```sql id="u1"
id UUID PRIMARY KEY
name TEXT
email TEXT
plan_type TEXT
created_at TIMESTAMP
```

---

## profiles

```sql id="u2"
id UUID PRIMARY KEY
user_id UUID
skills TEXT
education TEXT
experience TEXT
target_role TEXT
resume_url TEXT NULL
```

---

## interviews

```sql id="u3"
id UUID PRIMARY KEY
user_id UUID
role TEXT
type TEXT
score INTEGER
created_at TIMESTAMP
```

---

## interview_messages

```sql id="u4"
id UUID PRIMARY KEY
interview_id UUID
speaker TEXT
message TEXT
timestamp TIMESTAMP
```

---

## feedback

```sql id="u5"
id UUID PRIMARY KEY
interview_id UUID
communication_score INTEGER
technical_score INTEGER
confidence_score INTEGER
strengths TEXT
weaknesses TEXT
suggestions TEXT
```

---

## subscriptions

```sql id="u6"
id UUID PRIMARY KEY
user_id UUID
plan_type TEXT
status TEXT
created_at TIMESTAMP
```

---

# 11. API Endpoints

---

## Start Interview

```http id="api1"
POST /api/interview/start
```

### Response

```json
{
  "question": "Tell me about yourself",
  "audioUrl": "..."
}
```

---

## Submit Answer

```http id="api2"
POST /api/interview/respond
```

### Response

```json
{
  "nextQuestion": "Explain React state management",
  "audioUrl": "..."
}
```

---

## Generate Feedback

```http id="api3"
POST /api/interview/feedback
```

---

# 12. Folder Structure

```text id="fs1"
src/
 ├── app/
 ├── components/
 ├── api/
 ├── lib/
 ├── services/
 │     ├── openai.ts
 │     ├── elevenlabs.ts
 │     ├── speech.ts
 ├── hooks/
 ├── types/
 └── styles/
```

---

# 13. UI Design System

---

## Theme

* dark mode
* futuristic UI
* glassmorphism
* soft gradients

---

## Key UI Elements

* animated waveform
* voice recording indicator
* chat + voice hybrid layout
* interview timer
* analytics dashboard cards

---

# 14. Team Workflow (2 Developers)

---

## Developer 1 (Frontend)

* UI pages
* interview screen
* dashboard
* animations
* state handling

---

## Developer 2 (Backend + AI)

* Supabase setup
* OpenAI integration
* ElevenLabs integration
* APIs
* resume parsing
* interview logic

---

## Parallel Development Strategy

* Frontend uses mock APIs first
* Backend builds real AI logic separately
* Both merge via defined API contracts

---

# 15. Hackathon MVP Scope

---

## Must Build

* authentication
* interview UI
* voice conversation loop
* AI question generation
* ElevenLabs voice output
* feedback page
* deployment

---

## Optional (If Time)

* resume upload
* personality modes
* advanced analytics
* PDF report export

---

# 16. Demo Flow

---

## Step 1

Landing page

## Step 2

Login

## Step 3

Manual profile OR resume upload

## Step 4

Start interview

## Step 5

AI voice interviewer speaks

## Step 6

User responds

## Step 7

AI asks follow-up questions

## Step 8

Show feedback dashboard

---

# 17. Judging Advantages

---

## Innovation

Real-time voice AI interviewer

---

## Technical Depth

Combines:

* voice synthesis
* speech recognition
* LLM reasoning
* real-time interaction

---

## Practical Value

Solves real job preparation problem

---

## Startup Potential

Full SaaS freemium model included

---

# 18. Risks & Solutions

---

## Latency

Solution: cache responses + optimize prompts

---

## Speech errors

Solution: fallback text input

---

## Time limitation

Solution: MVP-first approach only

---

# 19. Future Vision

HireMind AI can evolve into:

* global interview platform
* university training tool
* AI HR assistant
* corporate hiring simulator
* career coaching SaaS

---

# 20. Final Summary

HireMind AI is a voice-first AI interview simulator powered by ElevenLabs that transforms job interview preparation into an immersive, realistic conversational experience with adaptive questioning, personalized feedback, and scalable SaaS potential.

