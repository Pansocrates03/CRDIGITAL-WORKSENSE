import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal/Modal';
import UpdateItemModal from '@/components/BacklogTable/UpdateItemModal';
import { MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

interface CompletedTask {
  id: string;
  type: string;
  name: string;
  status: string;
  description?: string;
  priority?: string;
}

interface CompletedItemsListProps {
  completedTasks: CompletedTask[];
  projectId: string;
  queryClient: any;
}

const CompletedItemsList: React.FC<CompletedItemsListProps> = ({ completedTasks, projectId, queryClient }) => {
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [editItem, setEditItem] = useState<CompletedTask | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completed Items</CardTitle>
      </CardHeader>
      <CardContent>
        {completedTasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No completed tasks yet.</div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {(showAllCompleted ? completedTasks : completedTasks.slice(0, 3)).map((item) => {
                const canEdit = item.id && item.name;
                return (
                  <div key={item.id} className="border rounded-lg p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-[var(--accent-pink)]">{item.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Done</span>
                        <button
                          style={{ background: 'none', border: 'none', cursor: canEdit ? 'pointer' : 'not-allowed' }}
                          onClick={() => canEdit && setEditItem(item)}
                          aria-label="Edit task"
                          disabled={!canEdit}
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-semibold text-base">{item.name}</h4>
                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    <div className="text-xs text-neutral-500">Priority: {item.priority || '—'}</div>
                  </div>
                );
              })}
            </div>
            {completedTasks.length > 3 && !showAllCompleted && (
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <Button variant="outline" onClick={() => setShowAllCompleted(true)}>
                  See more
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
      <Modal
        isOpen={showAllCompleted}
        onClose={() => setShowAllCompleted(false)}
        title="All Completed Items"
        size="l"
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div className="flex flex-col gap-4">
            {completedTasks.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-[var(--accent-pink)]">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Done</span>
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
          console.log("CompletedItemsList: Invalidating both assigned and completed queries after update");
          queryClient.invalidateQueries({ queryKey: ['assignedItems'] });
          queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
          toast.success('Item updated successfully!');
        }}
        onError={(msg) => {
          toast.error(msg || 'Failed to update item.');
        }}
        item={editItem as any}
      />
    </Card>
  );
};

export default CompletedItemsList; 