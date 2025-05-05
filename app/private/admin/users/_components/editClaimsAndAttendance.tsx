"use client";

import {
    BlocksState,
    adminSaveClaims,
    getUserBlockState,
} from "@/actions/claim";
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    fetchWithServerAction,
    useServerAction,
} from "@/hooks/use-server-action";
import { useEffect, useState } from "react";

import { BlockClaims } from "@/app/private/attending/claims/_components/clientPage";
import BlockElement from "@/app/private/attending/claims/_components/block";
import { Button } from "@/components/ui/button";
import ServerActionButton from "@/components/utility/ServerActionButton";
import { SetState } from "@/lib/utilityTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/lib/types";
import { catchUserError } from "@/lib/utils";
import { toast } from "sonner";

interface EditClaimsAndAttendanceProps {
    user: User;
    onSwitchEditScreen: SetState<"info" | "claimsAndAttendance">;
}

const EditClaimsAndAttendance = ({
    user,
    onSwitchEditScreen,
}: EditClaimsAndAttendanceProps) => {
    const [claims, setClaims] = useState<BlockClaims>({});

    const { action: saveClaimsAction, pending: editClaimsPending } =
        useServerAction({
            action: adminSaveClaims,
            successToast: "Volby uživatele byly uloženy úspěšně",
            errorToastTitle: "Volby uživatele se nepodařilo uložit",
            loadingToast: "Ukládám volby uživatele",
        });

    const {
        data: blockState,
        returningInitial: isBlockStateLoading,
        refresh: loadUserBlockState,
    } = fetchWithServerAction({
        action: async (id: number) => {
            const response = await getUserBlockState(id);

            const [data, error] = catchUserError(response);

            if (error) {
                toast.error("Nepodařilo se načíst volby uživatele");

                return [];
            }

            resetClaims(data);

            return data;
        },
        initial: [],
        initialArgs: false,
    });

    useEffect(() => {
        loadUserBlockState(user.id);
    }, [user.id]);

    const resetClaims = (data: BlocksState) => {
        const blockClaims: BlockClaims = {};

        data.forEach((d) => {
            blockClaims[d.id] = {
                primary: d.primaryClaim,
                secondary: d.secondaryClaim,
            };
        });

        setClaims(blockClaims);
    };

    const saveClaims = () => {
        saveClaimsAction({
            claims: blockState.map((b) => ({
                block: b.id,
                primaryArchetype: claims[b.id].primary ?? null,
                secondaryArchetype: claims[b.id].secondary ?? null,
            })),
            user: user.id,
        });
    };

    const onBackButtonClick = () => {
        onSwitchEditScreen("info");
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>Volby přednášek</DialogTitle>
                <DialogDescription />
            </DialogHeader>
            {!isBlockStateLoading ? (
                <>
                    {blockState.map((block) => (
                        <BlockElement
                            key={block.id}
                            block={block}
                            claims={claims[block.id]}
                            onClaimsChange={(newClaims) =>
                                setClaims((oldClaims) => ({
                                    ...oldClaims,
                                    [block.id]: newClaims,
                                }))
                            }
                            admin
                        />
                    ))}
                </>
            ) : (
                <Skeleton className="h-80" />
            )}
            <DialogFooter>
                <Button variant="outline" onClick={onBackButtonClick}>
                    Zpět
                </Button>
                <ServerActionButton
                    pending={editClaimsPending}
                    onClick={saveClaims}
                >
                    Uložit
                </ServerActionButton>
            </DialogFooter>
        </>
    );
};

export default EditClaimsAndAttendance;
