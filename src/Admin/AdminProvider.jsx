import { AdminSongProvider } from "./context/AdminSongContext";

export default function AdminProviders({ children }) {
  return <AdminSongProvider>{children}</AdminSongProvider>;
}
