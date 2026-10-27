export function Chip({ kind = 'blue', children }) {
  return <span className={`chip chip-${kind}`}>{children}</span>;
}

/* colour for each status / level word used across both portals */
const KIND = {
  Published: 'green', Active: 'green', Completed: 'green', Passed: 'green', Correct: 'green', Earned: 'green',
  Easy: 'green', Beginner: 'green',
  Draft: 'orange', Medium: 'orange', Intermediate: 'orange', 'Coming soon': 'orange', Locked: 'orange', Hidden: 'orange',
  Inactive: 'red', Hard: 'red', Advanced: 'red', Failed: 'red', Incorrect: 'red', 'Sold out': 'red',
  Student: 'blue', 'In progress': 'blue', New: 'blue',
  Admin: 'purple', 'Not started': 'purple'
};

export function StatusChip({ status }) {
  return <Chip kind={KIND[status] || 'blue'}>{status}</Chip>;
}
