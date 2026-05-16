Developer 1 (Frontend Lead)

You are building the frontend for a hackathon project called **HireMind AI**, a voice-based AI interview coach.

Your goal is to build a **clean, modern, production-ready frontend** using Next.js that supports a real-time AI voice interview experience.

You are working in a 2 developer team. Backend and AI logic will be handled separately. Your job is ONLY frontend, UI, and API integration layer (using mock data first, then real APIs later).

---

# Tech Stack (Frontend)

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion
* React hooks
* Zustand or simple context for state

---

# Core Objective

Build a **futuristic interview simulation UI** where users can:

1. Login / register
2. Create profile (manual entry for free users)
3. Upload resume (premium feature UI only)
4. Start AI interview session
5. See live interview conversation (voice + text UI)
6. View feedback dashboard after interview

---

# Important Constraints

* Backend is NOT ready yet, so use mock data or dummy API functions
* Focus heavily on UI/UX and smooth user experience
* Build reusable components
* Keep UI futuristic, clean, and hackathon-winning level
* Prioritize speed of development and visual impact

---

# Pages to Build

## 1. Landing Page

* Hero section
* “Start Interview” CTA
* Feature highlights
* Simple pricing section (Free vs Premium)

---

## 2. Auth Pages

* Login page
* Register page
* Simple Supabase-ready UI (no need to fully connect yet)

---

## 3. Dashboard

After login user sees:

* Start new interview button
* Past interview list (mock data)
* User plan status (Free / Premium)

---

## 4. Profile Setup Page

Two modes:

### Free User

* Manual form:

  * name
  * skills
  * education
  * target role

### Premium UI (disabled/locked state)

* Resume upload button (UI only)
* Locked badge for premium features

---

## 5. Interview Setup Page

* Select job role
* Select interview type (mock)
* Start interview button

---

## 6. Live Interview Page (MOST IMPORTANT)

This is the core UI.

Must include:

* AI interviewer voice panel (animated waveform UI)
* Live transcript chat view
* User speaking indicator
* “Listening / Speaking” states
* Timer
* Question display panel
* Smooth transitions between AI and user turns

Use mock responses initially like:

* AI question: “Tell me about yourself”
* User response: dummy text

This page must feel REAL and IMMERSIVE.

---

## 7. Feedback Page

After interview ends show:

* Score cards:

  * Communication
  * Confidence
  * Technical
* Strengths section
* Weaknesses section
* Suggestions section
* “Start New Interview” button

Make this page visually impressive.

---

# Component Structure (Important)

Create reusable components:

* Navbar
* Button (custom styled)
* Card
* InterviewWaveform
* VoiceChatBubble
* ScoreCard
* LockedFeatureBadge
* Loader / Skeleton states

---

# State Management

Use simple local state first.

Prepare structure for:

* user
* interview session
* messages
* feedback

Do NOT over-engineer.

---

# API Integration (Mock First)

Create a folder:

/lib/mockApi.ts

Include:

* startInterview()
* sendAnswer()
* getFeedback()

Return fake JSON responses so UI is fully testable.

---

# UI Style Guide

Design must feel:

* futuristic
* AI-native
* dark mode first
* glassmorphism cards
* smooth animations
* high-end SaaS product

Inspired by:

* OpenAI UI
* Vercel dashboard
* Linear.app

---

# Key Success Rule

If the backend is not ready, it should STILL look like a fully working AI product using mock data.

---

# Deliverable

By end of your work:

* Fully working frontend flow
* Smooth navigation between all pages
* Live interview UI that feels real
* Feedback dashboard with polished design
* Ready to connect backend APIs later
