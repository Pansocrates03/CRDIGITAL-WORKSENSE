import React, { FC } from "react";
import { Ticket } from "@/types/TicketType";
import { Button } from "@/components/ui/button";
import { X, Edit, Trash2, Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import styles from "./CreateItemModal.module.css";

interface TicketDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket;
    onEdit: () => void;
    onDelete: () => void;
}

const TicketDetailsModal: FC<TicketDetailsModalProps> = ({
    isOpen,
    onClose,
    ticket,
    onEdit,
    onDelete
}) => {
    if (!isOpen) return null;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "new":
                return "info";
            case "in progress":
                return "warning";
            case "completed":
                return "success";
            default:
                return "default";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case "high":
                return "destructive";
            case "medium":
                return "warning";
            case "low":
                return "success";
            default:
                return "default";
        }
    };

    // Calculate task statistics
    const totalTasks = ticket.tasks.length;
    const completedTasks = ticket.tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    const progressPercentage = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;

    return (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className="text-xl font-semibold">Ticket Details</h2>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onEdit}
                            className="flex items-center gap-1"
                        >
                            <Edit size={16} />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDelete}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                            <Trash2 size={16} />
                            Delete
                        </Button>
                        <Button
                            variant="outline"
                            className={styles.closeButton}
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <X size={18} />
                        </Button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Ticket Header */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold">{ticket.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={getStatusColor(ticket.status)}>
                                        {ticket.status}
                                    </Badge>
                                    <Badge variant={getPriorityColor(ticket.priority)}>
                                        {ticket.priority}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-600">{ticket.description || "No description provided"}</p>
                    </div>

                    {/* Progress Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Task Progress</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Overall Progress</span>
                                <span>{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{completedTasks}</div>
                                    <div className="text-sm text-gray-600">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{pendingTasks}</div>
                                    <div className="text-sm text-gray-600">Pending</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tasks Section */}
                    <div>
                        <h4 className="font-semibold mb-3">Tasks ({totalTasks})</h4>
                        <div className="space-y-2">
                            {ticket.tasks.length > 0 ? (
                                ticket.tasks.map((task, index) => (
                                    <div 
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            {task.completed ? (
                                                <Check className="text-green-600" size={18} />
                                            ) : (
                                                <Clock className="text-yellow-600" size={18} />
                                            )}
                                            <span className={task.completed ? "line-through text-gray-500" : ""}>
                                                {task.description}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    No tasks associated with this ticket
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetailsModal; 