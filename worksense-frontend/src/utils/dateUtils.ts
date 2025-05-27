// This utility function formats a date into 'YYYY-MM-DD' format
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// This utility function formats a timestamp received in supabase to date and returns 'DD/MM/YYYY' format
export function formatTimestamp({ _seconds, _nanoseconds }: { _seconds: number; _nanoseconds: number }): string {
  const date = new Date(_seconds * 1000);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}