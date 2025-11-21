interface MainLayoutProps {
  role: "AGENT" | "SUPERVISOR";
}

export default function MainLayout({ role }: MainLayoutProps) {
  // Recibe "AGENT" o "SUPERVISOR"
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Le pasa la pelota al Sidebar */}

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6"></main>
      </div>
    </div>
  );
}
