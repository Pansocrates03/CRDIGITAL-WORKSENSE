import React, {useState} from "react";
import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import { toast } from "sonner";
import {AvatarPicker} from "@/components/Account/AvatarPicker";
import {useUserProfile} from "@/hooks/useUserProfile";
import styles from "../Settings.module.css";
import {Pencil} from "lucide-react";

export const AccountTab: React.FC = () => {
    const {
        profile,
        loading,
        error: profileError,
        save,
        setProfile,
    } = useUserProfile();
    const [editing, setEditing] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);

    const handleSave = async () => {
        if (profile) {
            try {
                await save({nickName: profile.nickName, pfp: profile.avatar});
                setEditing(false);
                handleSuccess("Profile updated successfully", `Cool changes ${profile.nickName}`);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleSuccess = (msg: string, desc: string) => {
        toast.success(msg, desc);
    };

    if (loading) return <div/>;
    if (profileError || !profile)
        return (
            <div className={styles.errorMessage}>
                {profileError || "Profile not found"}
            </div>
        );

    return (
        <div className={styles.accountContainer}>
            <Card className={styles.accountCard}>
                <CardHeader className="flex items-center justify-between">
                    <CardTitle>My Account</CardTitle>
                    {!editing && (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditing(true)}
                            className="p-2 h-8 w-8"
                        >
                            <Pencil></Pencil>
                        </Button>
                    )}
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center">
                        <Avatar className="size-24 mb-4">
                            <AvatarImage src={profile.avatar}/>
                            <AvatarFallback>{profile.email[0]}</AvatarFallback>
                        </Avatar>
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
                                setProfile({...profile, nickName: e.target.value})
                            }
                            className="w-full px-3 py-2 rounded-md border disabled:opacity-50"
                        />
                    </div>
                    {editing && (
                        <div className="space-y-2">
                            <Button
                                variant="secondary"
                                onClick={() => setPickerOpen(!pickerOpen)}
                            >
                                {pickerOpen ? "Hide Avatar Picker" : "Choose Avatar"}
                            </Button>

                            {pickerOpen && (
                                <AvatarPicker
                                    onSelect={(url) => {
                                        setProfile({...profile, avatar: url});
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
                        <Button variant="secondary" onClick={() => setEditing(false)}>
                            Cancel
                        </Button>
                        <Button variant={"default"} onClick={handleSave}>Save</Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

