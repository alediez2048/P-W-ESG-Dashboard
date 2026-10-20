# P&W ESG Dashboard

Interactive ESG dashboard visualizing environmental impact and progress toward 2025 and 2030 targets.

The data in `public/` is synthetic. It keeps the structure of the real reporting files (GRI frameworks, regions, years, actuals and targets) so the dashboard behaves the same way, but every value is generated.

## Features

- **Overview**: Key Performance Indicators (KPIs) and global trends.
- **Regional Analysis**: Compare performance across different regions.
- **Data Explorer**: Searchable table of raw data with quality notes.

## Tech Stack

- React + TypeScript (Vite)
- Recharts (Visualization)
- Tailwind CSS (Styling)
- PapaParse (CSV Processing)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run local server:
   ```bash
   npm run dev
   ```
