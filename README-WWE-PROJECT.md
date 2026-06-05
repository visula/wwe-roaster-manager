# WWE Universe Mode Management System

A comprehensive web application for managing WWE 2K26 Universe Mode rosters, matches, championships, and roster switches.

## Features

- **Roster Management**: Manage wrestlers across 6 shows (RAW, Smackdown, NXT, TNA, AAA, AEW)
- **Match Scheduling**: Create and track matches with results
- **Championship System**: Track championship holders and auto-update on match results
- **Roster Transfers**: Move wrestlers between shows with history
- **Dashboard**: Quick stats and upcoming matches
- **Import/Export**: Convert between Excel and database

## Getting Started

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Open http://localhost:5000 in your browser

## Project Structure

```
wwe-universe-mode/
├── server/              # Express backend
│   ├── index.js        # Main server file
│   ├── db.js           # Database initialization
│   └── routes/         # API endpoints
├── public/             # Static HTML/CSS/JS
│   ├── index.html      # Main UI
│   └── styles.css      # Styling
└── data/               # SQLite database file
```
