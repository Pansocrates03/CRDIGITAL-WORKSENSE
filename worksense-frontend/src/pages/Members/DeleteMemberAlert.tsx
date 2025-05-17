import React from "react";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";

interface DeleteMemberAlertProps {
    memberName: string,
    onClose: () => void,
    onDelete: () => void,
    showDeleteAlert: boolean,
    isOpen?: boolean
}

export const DeleteMemberAlert: React.FC<DeleteMemberAlertProps> = ({
                                                                        memberName,
                                                                        onClose,
                                                                        onDelete,
                                                                        showDeleteAlert,
                                                                    }) => {
    return (
        <DeleteConfirmationModal message={`Are you sure you wan to delete ${memberName} 
    , this will delete al data related to the envolment of the user in the project`} onClose={onClose}
                                 onConfirm={onDelete} isOpen={showDeleteAlert}
                                 title={"Delete Member?"}></DeleteConfirmationModal>
    );
}; 