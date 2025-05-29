// src/pages/BacklogTable/BacklogTablePage.tsx

// Core Imports
import React, { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Compoent Imports
import BacklogHeader from "@/components/BacklogTable/BacklogHeader";
import BacklogTableSection from "@/components/BacklogTable/BacklogTableSection";
import SearchFilter from "@/components/BacklogTable/SearchFilter";
import BacklogRow from "@/components/BacklogTable/BacklogRow";
import DeleteConfirmationModal from "@/components/ui/deleteConfirmationModal/deleteConfirmationModal.tsx";
import CreateItemModal from "@/components/BacklogTable/CreateItemModal";
import UpdateItemModal from "@/components/BacklogTable/UpdateItemModal";
import GenerateStoriesModal from "@/components/BacklogTable/GenerateStoriesModal";
import ItemDetailsModal from "@/components/BacklogTable/ItemDetailsModal";
import StoryRow from "./components/StoryRow/StoryRow";
import { EpicRow } from "@/components/BacklogTable/EpicRow";
import { toast } from "sonner";

// HOOKS
import { useMembers } from "@/hooks/useMembers";
import { useSprints } from "@/hooks/useSprints";
import { useProject } from "@/hooks/useProjects";
import { useEpics } from "@/hooks/useEpics";
import { useStories } from "@/hooks/useStories";

// TYPES
import { Story } from "@/types/StoryType";
import { Epic } from "@/types/EpicType";

import styles from "./BacklogTablePage.module.css";
import { handleSuccess } from "@/utils/handleSuccessToast"; // This is likely the cause of a conflict if both branches modified it.
import { useFridaChatPosition } from "@/contexts/FridaChatPositionContext"; // Keep this import from 'geminiFrontIntento2'


const BacklogTablePage: FC = () => {
    const {id: projectId} = useParams<{ id: string }>();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<BacklogItemType | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedEpics, setExpandedEpics] = useState<string[]>([]);

    // Estados para el modal de confirmación de eliminación (from both branches)
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<BacklogItemType | null>(null);
    const [deleteModalName, setDeleteModalName] = useState("");
    const [deleteModalMessage, setDeleteModalMessage] = useState("");

    // Estados para el modal de generación de historias con IA (from both branches)
    const [showGenerateStoriesModal, setShowGenerateStoriesModal] = useState(false);
    const [selectedEpicId, setSelectedEpicId] = useState("");
    const [selectedEpicName, setSelectedEpicName] = useState("");

    // Estado para el modal de detalles (from both branches)
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Epic | Story | null>(null);

    // From 'geminiFrontIntento2' branch
    const { setPosition } = useFridaChatPosition();
    useEffect(() => {
        if (isModalOpen || isEditModalOpen || showDetailsModal) {
            setPosition("left");
        } else {
            setPosition("right");
        }
    }, [isModalOpen, isEditModalOpen, showDetailsModal]);


    // HOOKS
    const { data:project, isLoading:isProjectLoading, isError:isProjectError } = useProject(projectId || "");
    const { data:members = [], isLoading:isMembersLoading, isError:isMembersError } = useMembers(projectId || "");
    const { data:sprints = [], isLoading:isSprintsLoading, isError:isSprintsError } = useSprints(projectId || "");
    const { data:epics = [], isLoading:isEpicsLoading, isError:isEpicsError } = useEpics(projectId || "");
    const { data:stories = [], isLoading:isStoriesLoading, isError:isStoriesError, addStory } = useStories(projectId || "");

    if( isProjectLoading || isMembersLoading || isSprintsLoading || isEpicsLoading || isStoriesLoading){
        return <div>Loading page...</div>
    }
    if( isProjectError || isMembersError || isSprintsError || isEpicsError || isStoriesError){
        return <div>Error...</div>
    }

    // Update getEpicStories to use subItems directly
    const getEpicStories = (epicId: string): Story[] => {
        const filteredStories = stories.filter(story => story.parentId == epicId);
        return filteredStories || [];
    };

    // Edit Items
    const handleEditStory = (story:Story) => {}
    const handleEditEpic =(epic:Epic) => {}

    // Delete Items
    const handleDeleteEpic = (epic: Epic) => {

        const epicStories = getEpicStories(epic.id);
        const message =
            epicStories.length > 0
                ? `Are you sure you want to delete the epic "${epic.name}" and all its ${epicStories.length} stories ?`
                : `Are you sure you want to delete the epic "${epic.name}"?`;

        setDeleteModalName("Delete Epic");
        setDeleteModalMessage(message);
        setShowDeleteModal(true);
    };
    const handleDeleteStory = (story:Story) => {


        setDeleteModalName( `Delete Story "${story.name}"` );
        setDeleteModalMessage( `Deleting ${story.name} is a permanent action and cannot be undone.` );
        setShowDeleteModal(true);
    };

    // View Items
    const handleViewEpic = (epic:Epic) => {
        setSelectedItem(epic);
        setShowDetailsModal(true)
    }
    const handleViewStory = (story:Story) => {
        console.log("TODO")
    }



    // Función para abrir el modal de generación de historias con IA
    const handleGenerateStories = (epicId: string, epicName: string) => {
        if (!projectId) return;

        setSelectedEpicId(epicId);
        setSelectedEpicName(epicName);
        setShowGenerateStoriesModal(true);
    };

    const handleError = (msg: string) => {
        toast.error(msg);
    };

    const renderStories = (stories:Story[]) => stories.map(story => <StoryRow story={story}/> )
    



    const renderRows = (stories: Story[], indent = false) =>
        stories.map((story) => (
                <BacklogRow
                    key={story.id}
                    item={story}
                    indent={indent}
                    memberMap={members[0]}
                    onEdit={() => handleEditStory(story)}
                    onDelete={() => handleDeleteStory(story)}
                    onViewDetails={() => console.log("TODO")}
                    enableAiSuggestions={project?.enableAiSuggestions ?? true}

                    sprints={sprints}
                />
            ));


    return (
        <div className={"p-4"}>
            <BacklogHeader onAddItem={() => setIsModalOpen(true)}/>
            <div className="border-b border-border my-4"></div>
            <SearchFilter
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search backlog items..."
            />

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Sprint</th>
                        <th>Assignee</th>
                        <th>Size</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>

                    <BacklogTableSection title="Epics">
                        {epics.map((epic) => {
                            const epicStories = getEpicStories(epic.id);
                            return (
                                <React.Fragment key={epic.id}>
                                    <EpicRow
                                        epic={epic}
                                        epicStories={epicStories}
                                        isExpanded={expandedEpics.includes(epic.id)}
                                        onToggle={() =>
                                            setExpandedEpics((prev) =>
                                                prev.includes(epic.id)
                                                    ? prev.filter((id) => id !== epic.id)
                                                    : [...prev, epic.id]
                                            )
                                        }
                                        colSpan={6}
                                        onEdit={() => handleEditEpic(epic)}
                                        onDelete={() => handleDeleteEpic(epic)}
                                        onGenerateStories={handleGenerateStories}
                                        enableAiSuggestions={project?.enableAiSuggestions ?? true}
                                        sprints={sprints}
                                    />
                                    {expandedEpics.includes(epic.id) &&
                                        renderRows(epicStories, true)}
                                </React.Fragment>
                            );
                        })}
                    </BacklogTableSection>

                    <BacklogTableSection title="User Stories">
                        {renderStories(stories)}
                    </BacklogTableSection>
                    {/* 
                    <BacklogTableSection title="Bugs">
                        {renderRows(categorized.bugs)}
                    </BacklogTableSection>
                    
                    <BacklogTableSection title="Tech Tasks">
                        {renderRows(categorized.techTasks)}
                    </BacklogTableSection>
                    
                    <BacklogTableSection title="Knowledge Items">
                        {renderRows(categorized.knowledge)}
                    </BacklogTableSection>
                    */}
                    </tbody>
                </table>
            </div>

            {/* CREATE ITEM MODAL */}
            {projectId && (
                <CreateItemModal
                    projectId={projectId}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onItemCreated={() => {

                        handleSuccess("Item  created successfully!",
                            "You should now see the item in the backlog.");
                        //refetch();
                    }}
                    onError={handleError}
                />
            )}

            {projectId && (
                <UpdateItemModal
                    projectId={projectId}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onItemUpdated={() => {
                        handleSuccess(`The ${itemToEdit?.type} ${itemToEdit?.name} was updated successfully!`, "You should now see the updated item in the backlog.");
                        //refetch();
                    }}
                    onError={handleError}
                    item={itemToEdit}
                />
            )}

            {projectId && (
                <GenerateStoriesModal
                    projectId={projectId}
                    epicId={selectedEpicId}
                    epicName={selectedEpicName}
                    isOpen={showGenerateStoriesModal}
                    onClose={() => setShowGenerateStoriesModal(false)}
                    onStoriesAdded={() => console.log("TO-DO")}
                    onError={handleError}
                />
            )}
{/*
            {projectId && (
                <ItemDetailsModal
                    projectId={projectId}
                    isOpen={showDetailsModal}
                    linkedEpic={selectedItem?.parentId ?
                        epics.find(epic => epic.id === selectedItem.parentId) || null
                        : null}
                    onClose={() => setShowDetailsModal(false)}
                    onEditClick={() => {
                        setItemToEdit(selectedItem);
                        setIsEditModalOpen(true);
                        setShowDetailsModal(false);
                    }}
                    item={selectedItem}
                    memberInfo={getMemberInfo(selectedItem?.assigneeId)}
                />
            )}
*/}

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => console.log("TO-DO")}
                title={deleteModalName}
                message={deleteModalMessage}
            />

        </div>
    );
};

export default BacklogTablePage;