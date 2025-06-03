import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal/Modal';
import UpdateItemModal from '@/components/BacklogTable/UpdateItemModal';
import { MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import StatusBadge from '@/components/BacklogTable/StatusBadge';

interface AssignedItem {
  id: string;
  type: string;
  name: string;
  status: string;
  description?: string;
  priority?: string;
}

interface AssignedItemsListProps {
  assignedItems: AssignedItem[];
  projectId: string;
  queryClient: any;
}

const AssignedItemsList: React.FC<AssignedItemsListProps> = ({ assignedItems, projectId, queryClient }) => {
  const [showAllAssigned, setShowAllAssigned] = useState(false);
  const [editItem, setEditItem] = useState<AssignedItem | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Items</CardTitle>
      </CardHeader>
      <CardContent>
        {assignedItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No items assigned to you yet.</div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {(showAllAssigned ? assignedItems : assignedItems.slice(0, 3)).map((item) => (
                <div key={item.id} className="border rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[var(--accent-pink)]">{item.type}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge type="status" value={item.status} />
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => setEditItem(item)}
                        aria-label="Edit item"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-semibold text-base">{item.name}</h4>
                  {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                  <div className="text-xs text-neutral-500">Priority: {item.priority || '—'}</div>
                </div>
              ))}
            </div>
            {assignedItems.length > 3 && !showAllAssigned && (
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <Button variant="outline" onClick={() => setShowAllAssigned(true)}>
                  See more
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
      <Modal
        isOpen={showAllAssigned}
        onClose={() => setShowAllAssigned(false)}
        title="All Assigned Items"
        size="l"
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div className="flex flex-col gap-4">
            {assignedItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-[var(--accent-pink)]">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge type="status" value={item.status} />
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={() => setEditItem(item)}
                      aria-label="Edit item"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
                <h4 className="font-semibold text-base">{item.name}</h4>
                {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                <div className="text-xs text-neutral-500">Priority: {item.priority || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
      <UpdateItemModal
        projectId={projectId}
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        onItemUpdated={() => {
          setEditItem(null);
          console.log("AssignedItemsList: Invalidating both assigned and completed queries after update");
          queryClient.invalidateQueries({ queryKey: ['assignedItems'] });
          queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
        }}
        onError={(msg) => {
          toast.error(msg || 'Failed to update item.');
        }}
        item={editItem as any}
      />
    </Card>
  );
};

export default AssignedItemsList; 