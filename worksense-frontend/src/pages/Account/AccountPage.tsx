import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { AvatarPicker } from "@/components/Account/AvatarPicker";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Pencil } from "lucide-react";

export const AccountPage: React.FC = () => {
  const { profile, loading, error, save, setProfile } = useUserProfile();
  const [editing, setEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (loading)
    return <div className="container mx-auto p-8 text-center">Loading…</div>;
  if (error || !profile)
    return (
      <div className="container mx-auto p-8 text-destructive text-center">
        {error || "Profile not found"}
      </div>
    );

  const handleSave = async () => {
    await save({ nickName: profile.nickName, pfp: profile.avatar });
    setEditing(false);
  };

  return (
    <>
      <Toaster
        position="bottom-right"
        closeButton
        toastOptions={{
          classNames: {
            toast: "rounded-lg border shadow-lg",
            success: "bg-[#F8EAF0] text-[#AC1754] border-[#AC1754]",
            error: "bg-[#FFEBEE] text-[#C62828] border-[#C62828]",
          },
          duration: 4000,
        }}
      />

      <div className="container mx-auto max-w-xl p-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>My Account</CardTitle>
            {!editing && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(true)}
                className="p-2 h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <AvatarDisplay 
                user={{
                  name: profile.fullName || profile.email,
                  profilePicture: profile.avatar
                }}
                size="lg"
                className="mb-4"
              />
              <h2 className="text-lg font-semibold text-center">
                {profile.fullName || profile.email}
              </h2>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nickname</label>
              <input
                value={profile.nickName || ""}
                disabled={!editing}
                onChange={(e) =>
                  setProfile({ ...profile, nickName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border disabled:opacity-50"
              />
            </div>
            {editing && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setPickerOpen(!pickerOpen)}
                >
                  {pickerOpen ? "Hide Avatar Picker" : "Choose Avatar"}
                </Button>

                {pickerOpen && (
                  <AvatarPicker
                    onSelect={(url) => {
                      setProfile({ ...profile, avatar: url });
                      setPickerOpen(false);
                    }}
                  />
                )}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                value={profile.email}
                disabled
                className="w-full px-3 py-2 rounded-md border bg-muted opacity-70"
              />
            </div>
          </CardContent>

          {editing && (
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
};

export default AccountPage;
