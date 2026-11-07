# Summora React + Vite Frontend

Modern, glassmorphic UI built with React 18, Vite, Tailwind CSS, and Axios for the Summora AI Summarizer platform.

## Features
- **Modern Glassmorphism Design**: Dark/Light mode theme toggle with custom HSL color tokens.
- **Interactive Workspaces**: Text paste editor and drag-and-drop PDF file parser.
- **Side-by-Side Comparison Lab**: Dual view comparing Extractive (TextRank) vs Abstractive (BART).
- **Interactive Analytics**: Animated ROUGE progress bars, KeyBERT keyword badges, spaCy NER entity tags.
- **History Archive**: Saved summaries with search filtering, view modal, and deletion.
- **Exporting Options**: Download summaries in plain `.txt` or printable `.pdf` formats.

## Setup & Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Optionally set `VITE_API_URL` in `.env`:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build Production Bundle**:
   ```bash
   npm run build
   ```
