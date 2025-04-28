// Main Imports
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

// Components
import MembersList from '../../components/MembersList/MembersList';


const MembersPage: React.FC = () => {
  const params = useParams();
  const projectId = params?.id as string;

  return (
    <div>
      <div className="flex items-baseline justify-between w-full">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Members
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage project members: add, update roles, or remove members from the project.
          </p>
        </div>

        <Button
          variant="default"
          size="default"
          className="bg-[#ac1754] hover:bg-[#8e0e3d] flex-shrink-0"
          onClick={() => alert(projectId)}
        >
          <PlusIcon className="mr-1 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="border-b border-border my-4"></div>

      <MembersList />
    </div>
  );
}

export default MembersPage;
