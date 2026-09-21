import { Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { AnalyzerPage } from "./pages/AnalyzerPage";
import { ResultPage } from "./pages/ResultPage";
import { HistoryPage } from "./pages/HistoryPage";
import { AboutPage } from "./pages/AboutPage";

function App() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<AnalyzerPage />} />
          <Route path="/result/:id" element={<ResultPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <footer className="mx-auto max-w-5xl px-5 py-8 text-xs text-[var(--color-ink-faint)]">
        JobShield is a student project. It doesn't guarantee that any job is legitimate or fraudulent — always verify independently.
      </footer>
    </div>
  );
}

export default App;
