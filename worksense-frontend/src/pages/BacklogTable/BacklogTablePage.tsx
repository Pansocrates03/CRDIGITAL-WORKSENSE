// src/pages/BacklogTable/BacklogTablePage.tsx

// Core Imports
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Compoent Imports
import BacklogHeader from "@/components/BacklogTable/BacklogHeader";
import BacklogTableSection from "@/components/BacklogTable/BacklogTableSection";
import SearchFilter from "@/components/BacklogTable/SearchFilter";
import DeleteConfirmationModal from "@/components/ui/deleteConfirmationModal/deleteConfirmationModal.tsx";
import UpdateItemModal from "@/components/BacklogTable/UpdateItemModal";
import GenerateStoriesModal from "@/components/BacklogTable/GenerateStoriesModal";
import StoryRow from "./components/Rows/StoryRow";
import EpicRow from "./components/Rows/EpicRow";
import { toast } from "sonner"
import TicketRow from "./components/Rows/TicketRow";

import EpicModal from "./components/Modals/EpicModal";
import StoryModal from "./components/Modals/StoryModal";
import TicketModal from "./components/Modals/TicketModal";
import EpicDetailsModal from "./components/Modals/EpicDetailsModal";
import StoryDetailsModal from "./components/Modals/StoryDetailsModal";
import TicketDetailsModal from "./components/Modals/TicketDetailsModal";

// HOOKS
import { useMembers } from "@/hooks/useMembers";
import { useSprints } from "@/hooks/useSprints";
import { useProject } from "@/hooks/useProjects";
import { useEpics } from "@/hooks/useEpics";
import { useStories } from "@/hooks/useStories";

// TYPES
import { Story } from "@/types/StoryType";
import { Epic } from "@/types/EpicType";
import { Ticket } from "@/types/TicketType";

type BacklogItemType = Epic | Story | Ticket;

import styles from "./BacklogTablePage.module.css";
import { handleSuccess } from "@/utils/handleSuccessToast"; // This is likely the cause of a conflict if both branches modified it.
import { useFridaChatPosition } from "@/contexts/FridaChatPositionContext"; // Keep this import from 'geminiFrontIntento2'
import { useTickets } from "@/hooks/useTickets";


const BacklogTablePage: FC = () => {
    const {id: projectId} = useParams<{ id: string }>();

    const [isModalOpen, setIsModalOpen] = useState(false); // Used for AI purposes
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Used for AI Purposes

    const [itemToEdit, setItemToEdit] = useState<BacklogItemType | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Estados de modales
    const [showEpicModal, setShowEpicModal] = useState(false);
    const [showStoryModal, setShowStoryModal] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);

    // Estados para el modal de confirmación de eliminación (from both branches)
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteModalName, setDeleteModalName] = useState("");
    const [deleteModalMessage, setDeleteModalMessage] = useState("");

    // Estados para el modal de generación de historias con IA (from both branches)
    const [showGenerateStoriesModal, setShowGenerateStoriesModal] = useState(false);
    const [selectedEpicId, setSelectedEpicId] = useState("");
    const [selectedEpicName, setSelectedEpicName] = useState("");

    // Estado para el modal de detalles (from both branches)
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Add state for epic details modal
    const [showEpicDetailsModal, setShowEpicDetailsModal] = useState(false);
    const [selectedEpicForDetails, setSelectedEpicForDetails] = useState<Epic | null>(null);

    // Add state for story details modal
    const [showStoryDetailsModal, setShowStoryDetailsModal] = useState(false);
    const [selectedStoryForDetails, setSelectedStoryForDetails] = useState<Story | null>(null);
    const [showTicketDetailsModal, setShowTicketDetailsModal] = useState(false);
    const [selectedTicketForDetails, setSelectedTicketForDetails] = useState<Ticket | null>(null);

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
    const { data:epics = [], isLoading:isEpicsLoading, isError:isEpicsError, deleteEpic } = useEpics(projectId || "");
    const { data:stories = [], isLoading:isStoriesLoading, isError:isStoriesError, addStory, deleteStory } = useStories(projectId || "");
    const { data:tickets = [], isLoading:isTicketsLoading, isError:isTicketsError, deleteTicket } = useTickets(projectId!) 

    if( isProjectLoading || isMembersLoading || isSprintsLoading || isEpicsLoading || isStoriesLoading){
        return <div>Loading page...</div>
    }
    if( isProjectError || isMembersError || isSprintsError || isEpicsError || isStoriesError){
        return <div>Error...</div>
    }

    let independientStories = stories.filter(s => !s.parentId || s.parentId.length <= 0)
    let independientTickets = tickets.filter(t => !t.parentId || t.parentId.length <= 0)

    // Update getEpicStories to use subItems directly
    const getEpicStories = (epicId: string): Story[] => {
        const filteredStories = stories.filter(story => story.parentId == epicId);
        return filteredStories || [];
    };
    const getStoryTickets = (storyId:string): Ticket[] => {
        const filteredTickets = tickets.filter(ticket => ticket.parentId == storyId);
        return filteredTickets
    } 

    const handleDeleteItem = (type:"epic"|"story"|"ticket", itemId:string) => {

        setDeleteModalName(`Delete ${type}`);
        setDeleteModalMessage(`Are you sure you want to delete this ${type}? This action cannot be undone.`);
        setShowDeleteModal(true);

        if(type == "epic") deleteEpic(itemId)
        else if (type == "story") deleteStory(itemId)
        else if (type == "ticket") deleteTicket(itemId)
    }
    const handleViewItem = (type: "epic" | "story" | "ticket", itemId: string) => {
        if (type === "epic") {
            const epic = epics.find(e => e.id === itemId);
            if (epic) {
                setSelectedEpicForDetails(epic);
                setShowEpicDetailsModal(true);
            }
        } else if (type === "story") {
            const story = stories.find(s => s.id === itemId);
            if (story) {
                setSelectedStoryForDetails(story);
                setShowStoryDetailsModal(true);
            }
        } else if (type === "ticket") {
            const ticket = tickets.find(t => t.id === itemId);
            if (ticket) {
                setSelectedTicketForDetails(ticket);
                setShowTicketDetailsModal(true);
            }
        }
    };
    const handleEditItem = (type: "epic" | "story" | "ticket", itemId: string) => {
        if (type === "epic") {
            const epicToEdit = epics.find(e => e.id === itemId);
            if (epicToEdit) {
                setItemToEdit(epicToEdit);
                setShowEpicModal(true);
            }
        } else if (type === "story") {
            
            const storyToEdit = stories.find(s => s.id === itemId);
            if (storyToEdit) {
                setItemToEdit(storyToEdit);
                setShowStoryModal(true);
            }
        } else if (type === "ticket") {
            const ticketToEdit = tickets.find(t => t.id === itemId);
            if (ticketToEdit) {
                setItemToEdit(ticketToEdit);
                setShowTicketModal(true);
            }
        }
    };



    // Add handler for adding story to epic
    const handleAddStoryToEpic = () => {
        if (selectedEpicForDetails) {
            setShowEpicDetailsModal(false);
            setShowStoryModal(true);
            // TODO: Set the parentId in the StoryModal
        }
    };

    // Función para abrir el modal de generación de historias con IA
    const handleGenerateStories = (epicId: string, epicName: string) => {
        if (!projectId) return;

        setSelectedEpicId(epicId);
        setSelectedEpicName(epicName);
        setShowGenerateStoriesModal(true);
    };

    // Add handler for adding ticket to story
    const handleAddTicketToStory = () => {
        if (selectedStoryForDetails) {
            setShowStoryDetailsModal(false);
            setShowTicketModal(true);
            // TODO: Set the parentId in the TicketModal
        }
    };

    const handleError = (msg: string) => {
        toast.error(msg);
    };

    const renderEpics = (epics:Epic[]) => epics.map(epic => {
        return (
            <EpicRow
                epic={epic}
                epicStories={getEpicStories(epic.id)}
                getStoryTickets={getStoryTickets}
                handleView={handleViewItem}
                handleEdit={handleEditItem}
                handleDelete={handleDeleteItem} />
        )
    });
    const renderStories = (stories:Story[]) => stories.map(story => {
        return (
            <StoryRow
                story={story}
                storyTickets={getStoryTickets(story.id)}
                handleView={handleViewItem}
                handleEdit={handleEditItem}
                handleDelete={handleDeleteItem} />
        )
    })
    const renderTickets = (tickets:Ticket[]) => tickets.map(ticket => {
        return (
            <TicketRow
                ticket={ticket}
                handleView={handleViewItem}
                handleEdit={handleEditItem}
                handleDelete={handleDeleteItem} />
        )
    })


    return (
        <div className={"p-4"}>
            <BacklogHeader onAddItem={(type) => {

                // Close the popover
                const popoverTrigger = document.querySelector('[data-state="open"]');
                if (popoverTrigger) {
                    (popoverTrigger as HTMLElement).click();
                }

                // Show the modal creation
                if (type === 'epic') setShowEpicModal(true);
                else if (type === "story") setShowStoryModal(true)
                else if (type === "ticket") setShowTicketModal(true)
                else setIsModalOpen(true)
                
            }}/>
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
                        {renderEpics(epics)}
                    </BacklogTableSection>

                    <BacklogTableSection title="User Stories">
                        {renderStories(independientStories)}
                    </BacklogTableSection>

                    <BacklogTableSection title="Tickets">
                        {renderTickets(independientTickets)}
                    </BacklogTableSection>

                    {/* Tickets already consider BUGS, TECH TASKS and KNOWLEDGE ITEMS*/}

                    </tbody>
                </table>
            </div>

            {/* EPIC MODAL */}
            {projectId && (
                <EpicModal
                    mode={itemToEdit ? "update" : "create"}
                    projectId={projectId}
                    isOpen={showEpicModal}
                    onClose={() => {
                        setShowEpicModal(false);
                        setItemToEdit(null);
                    }}
                    onEpicCreated={() => {
                        handleSuccess("Epic created successfully!",
                            "You should now see the epic in the backlog.");
                        setItemToEdit(null);
                    }}
                    onEpicUpdated={() => {
                        handleSuccess("Epic updated successfully!");
                        setItemToEdit(null);
                    }}
                    onError={handleError}
                    epic={itemToEdit as Epic}
                />
            )}

            {/* STORY MODAL */}
            {projectId && (
                <StoryModal
                    mode={itemToEdit ? "update" : "create"}
                    projectId={projectId}
                    isOpen={showStoryModal}
                    onClose={() => {
                        setShowStoryModal(false);
                        setItemToEdit(null);
                    }}
                    onStoryCreated={() => {
                        handleSuccess("Story created successfully");
                        setItemToEdit(null);
                    }}
                    onStoryUpdated={() => {
                        handleSuccess("Story updated successfully");
                        setItemToEdit(null);
                    }}
                    onError={handleError}
                    story={itemToEdit as Story}
                />
            )}

            {/* TICKET MODAL */}
            {projectId && (
                <TicketModal
                    mode={itemToEdit ? "update" : "create"}
                    projectId={projectId}
                    isOpen={showTicketModal}
                    onClose={() => {
                        setShowTicketModal(false);
                        setItemToEdit(null);
                    }}
                    onTicketCreated={() => {
                        handleSuccess("Ticket created successfully");
                        setItemToEdit(null);
                    }}
                    onTicketUpdated={() => {
                        handleSuccess("Ticket updated successfully");
                        setItemToEdit(null);
                    }}
                    onError={handleError}
                    ticket={itemToEdit as Ticket}
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

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => console.log("TO-DO")}
                title={deleteModalName}
                message={deleteModalMessage}
            />

            {/* Add EpicDetailsModal */}
            {selectedEpicForDetails && (
                <EpicDetailsModal
                    isOpen={showEpicDetailsModal}
                    onClose={() => {
                        setShowEpicDetailsModal(false);
                        setSelectedEpicForDetails(null);
                    }}
                    epic={selectedEpicForDetails}
                    stories={getEpicStories(selectedEpicForDetails.id)}
                    onEdit={() => {
                        setShowEpicDetailsModal(false);
                        setItemToEdit(selectedEpicForDetails);
                        setShowEpicModal(true);
                    }}
                    onDelete={() => {
                        setShowEpicDetailsModal(false);
                        handleDeleteItem("epic", selectedEpicForDetails.id);
                    }}
                    onAddStory={handleAddStoryToEpic}
                />
            )}

            {/* Add StoryDetailsModal */}
            {selectedStoryForDetails && (
                <StoryDetailsModal
                    isOpen={showStoryDetailsModal}
                    onClose={() => {
                        setShowStoryDetailsModal(false);
                        setSelectedStoryForDetails(null);
                    }}
                    story={selectedStoryForDetails}
                    tickets={getStoryTickets(selectedStoryForDetails.id)}
                    onEdit={() => {
                        setShowStoryDetailsModal(false);
                        setItemToEdit(selectedStoryForDetails);
                        setShowStoryModal(true);
                    }}
                    onDelete={() => {
                        setShowStoryDetailsModal(false);
                        handleDeleteItem("story", selectedStoryForDetails.id);
                    }}
                    onAddTicket={handleAddTicketToStory}
                />
            )}

            {/* Add TicketDetailsModal */}
            {selectedTicketForDetails && (
                <TicketDetailsModal
                    isOpen={showTicketDetailsModal}
                    onClose={() => {
                        setShowTicketDetailsModal(false);
                        setSelectedTicketForDetails(null);
                    }}
                    ticket={selectedTicketForDetails}
                    onEdit={() => {
                        setShowTicketDetailsModal(false);
                        setItemToEdit(selectedTicketForDetails);
                        setShowTicketModal(true);
                    }}
                    onDelete={() => {
                        setShowTicketDetailsModal(false);
                        handleDeleteItem("ticket", selectedTicketForDetails.id);
                    }}
                />
            )}

        </div>
    );
};

export default BacklogTablePage;