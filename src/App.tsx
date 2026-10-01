import { Navigate, Route, Routes } from "react-router-dom";
import { useApp } from "./context/AppContext";
import { Welcome } from "./pages/Welcome";
import { MyJournals } from "./pages/MyJournals";
import { CreateJournal } from "./pages/CreateJournal";
import { JournalView } from "./pages/JournalView";
import { JournalSettings } from "./pages/JournalSettings";
import { NewMemory } from "./pages/NewMemory";
import { ReviewMemory } from "./pages/ReviewMemory";
import { OrganizePages } from "./pages/OrganizePages";
import { BookPreview } from "./pages/BookPreview";
import { Stats } from "./pages/Stats";

export function App() {
  const { journals } = useApp();

  return (
    <Routes>
      <Route path="/" element={journals.length === 0 ? <Welcome /> : <MyJournals />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/create" element={<CreateJournal />} />
      <Route path="/journal/:journalId" element={<JournalView />} />
      <Route path="/journal/:journalId/settings" element={<JournalSettings />} />
      <Route path="/journal/:journalId/new" element={<NewMemory />} />
      <Route path="/journal/:journalId/review" element={<ReviewMemory />} />
      <Route path="/journal/:journalId/memory/:memoryId/edit" element={<ReviewMemory />} />
      <Route path="/journal/:journalId/organize" element={<OrganizePages />} />
      <Route path="/journal/:journalId/book" element={<BookPreview />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
