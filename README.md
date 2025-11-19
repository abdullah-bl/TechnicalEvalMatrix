# Technical Evaluation Matrix (مصفوفة التقييم الفني)

A client-side React application for evaluating and ranking technical projects or competitors based on weighted criteria.

## Features

*   **Weighted Criteria**: Define custom evaluation criteria with specific weights (must sum to 100%).
*   **Competitor Management**: Add multiple competitors or companies to be evaluated.
*   **Interactive Scoring**: Score each competitor against the criteria.
*   **Real-time Calculation**: Automatic calculation of total scores based on weighted averages.
*   **Detailed Reports**: View and print comprehensive reports with rankings and detailed breakdowns.
*   **Client-Side Persistence**: All data is saved locally in your browser (LocalStorage), ensuring privacy and persistence without a backend server.
*   **Arabic UI**: Fully localized Arabic interface.

## Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm (v9 or higher)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/TechnicalEvalMatrix.git
    cd TechnicalEvalMatrix
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173`.

## Building for Production

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

1.  Push your changes to the `main` branch.
2.  Go to your repository settings on GitHub.
3.  Navigate to **Pages**.
4.  Under **Build and deployment**, select **GitHub Actions** as the source.
5.  The workflow will automatically build and deploy the application.

## Technologies Used

*   [React](https://reactjs.org/)
*   [Vite](https://vitejs.dev/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Shadcn UI](https://ui.shadcn.com/)
*   [Lucide React](https://lucide.dev/)

## License

MIT
