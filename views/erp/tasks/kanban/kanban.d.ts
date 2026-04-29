import { Task } from "@/types"

/**
 * Summary of KanbanTask interface
 *
 * 1. Extends the base Task interface with an additional columnId property
 * 2. columnId is used to track which column the task belongs to in the Kanban board
 */
export interface KanbanTask extends Task {
  columnId: string
}

/**
 * Summary of KanbanBoard component
 *
 * 1. Displays tasks in a Kanban board format with columns for different statuses
 */
export interface KanbanColumn {
  id: string
  label: string
}
