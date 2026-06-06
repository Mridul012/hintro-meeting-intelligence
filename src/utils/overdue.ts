export function isOverdue(item: { dueDate: Date | null; status: string }): boolean {
  if (!item.dueDate) return false;
  if (item.status === "COMPLETED") return false;
  return item.dueDate < new Date();
}
