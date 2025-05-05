"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";

import EditAccountInfo from "./editAccountInfo";
import EditClaimsAndAttendance from "./editClaimsAndAttendance";
import { SetState } from "@/lib/utilityTypes";
import { User } from "@/lib/types";

interface EditDialogProps {
    user: User;
    setEditDialogUser: SetState<User | null>;
    open: boolean;
    onOpenChange: SetState<boolean>;
}

const EditDialog = ({ user, open, onOpenChange }: EditDialogProps) => {
    const [screen, setScreen] = useState<"info" | "claimsAndAttendance">(
        "info",
    );

    useEffect(() => {
        setScreen("info");
    }, [user.id]);

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) setScreen("info");

                onOpenChange(isOpen);
            }}
        >
            <DialogContent className="flex flex-col gap-4 lg:max-w-xl">
                {screen === "info" && (
                    <EditAccountInfo
                        user={user}
                        onOpenChange={onOpenChange}
                        onSwitchEditScreen={setScreen}
                    />
                )}
                {screen === "claimsAndAttendance" && (
                    <EditClaimsAndAttendance
                        user={user}
                        onSwitchEditScreen={setScreen}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default EditDialog;
