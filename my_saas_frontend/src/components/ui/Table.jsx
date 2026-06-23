export function Table({ columns, data, onRowClick, emptyMessage = "No data found" }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-brand-border">
            {columns.map((col) => (
              <th key={col.key} className={`table-header text-left ${col.className || ""}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-brand-subtle text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                className={`border-b border-brand-border/50 last:border-0 ${
                  onRowClick ? "hover:bg-brand-surface cursor-pointer" : ""
                } transition-colors`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`table-cell ${col.cellClassName || ""}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({ status }) {
  const styles = {
    active: "badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    expiring: "badge bg-amber-500/10 text-amber-400 border border-amber-500/20",
    expired: "badge bg-red-500/10 text-red-400 border border-red-500/20",
    inactive: "badge bg-gray-500/10 text-gray-400 border border-gray-500/20",
  };
  const labels = { active: "Active", expiring: "Expiring", expired: "Expired", inactive: "Inactive" };
  return <span className={styles[status] || styles.inactive}>{labels[status] || status}</span>;
}
