export default function DashboardLoading() {
  return (
    <div aria-label="Cargando contenido" className="animate-pulse space-y-6">
      <div className="h-8 w-64 rounded bg-ink/10" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="h-28 rounded-xl bg-ink/10" key={index} />
        ))}
      </div>
      <div className="h-72 rounded-xl bg-ink/10" />
    </div>
  );
}
