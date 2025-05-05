"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { deleteAttendances, generateAttendances } from "@/actions/utils";
import {
    recalculateAll,
    recalculateArchetypeInterested,
    recalculateBlockArchetypeLookup,
    recalculateEventAttending,
} from "@/actions/lookup";

import { Button } from "@/components/ui/button";
import { Fragment } from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import ServerActionButton from "@/components/utility/ServerActionButton";
import { TriangleAlert } from "lucide-react";
import { configuration } from "@/configuration/configuration";
import { useServerAction } from "@/hooks/use-server-action";

interface ClientUtilityPageProps {
    claimsPerUser: {
        id: number;
        user: string;
        claims: number;
    }[];
    claimsPerUserFrequency: { [key: number]: number };
}

const ClientUtilityPage = ({
    claimsPerUser,
    claimsPerUserFrequency,
}: ClientUtilityPageProps) => {
    const { action: archetypeInterested, pending: archetypeInterestedPending } =
        useServerAction({
            action: recalculateArchetypeInterested,
            successToast: "Mezivýpočty úspěšně obnoveny",
            loadingToast: "Obnovování mezivýpočtů",
            errorToastTitle: "Při obnovování mezivýpočtů došlo k chybě",
        });

    const { action: eventAttending, pending: eventAttendingPending } =
        useServerAction({
            action: recalculateEventAttending,
            successToast: "Mezivýpočty úspěšně obnoveny",
            loadingToast: "Obnovování mezivýpočtů",
            errorToastTitle: "Při obnovování mezivýpočtů došlo k chybě",
        });

    const {
        action: blockArchetypeLookup,
        pending: blockArchetypeLookupPending,
    } = useServerAction({
        action: recalculateBlockArchetypeLookup,
        successToast: "Mezivýpočty úspěšně obnoveny",
        loadingToast: "Obnovování mezivýpočtů",
        errorToastTitle: "Při obnovování mezivýpočtů došlo k chybě",
    });

    const { action: all, pending: allPending } = useServerAction({
        action: recalculateAll,
        successToast: "Mezivýpočty úspěšně obnoveny",
        loadingToast: "Obnovování mezivýpočtů",
        errorToastTitle: "Při obnovování mezivýpočtů došlo k chybě",
    });

    const {
        action: generateAttendancesAction,
        pending: generateAttendancesPending,
    } = useServerAction({
        action: generateAttendances,
        successToast: "Účastníci byli úspěšně rozřazeni",
        loadingToast: "Rozřazování účastníků...",
        errorToastTitle: "Při rozřazování účastníků došlo k chybě",
    });

    const {
        action: deleteAttendancesAction,
        pending: deleteAttendancesPending,
    } = useServerAction({
        action: deleteAttendances,
        successToast: "Rozřazení účastníků bylo úspěšně zrušeno",
        loadingToast: "Rušení rozřazení...",
        errorToastTitle: "Při rušení rozřazení účastníků došlo k chybě",
    });

    return (
        <div className="flex w-full flex-col gap-4">
            <Alert variant="destructive">
                <TriangleAlert className="size-4" />
                <AlertTitle>Upozornění</AlertTitle>
                <AlertDescription>
                    Pokud přesně nerozumíte, co následující možnosti dělají,
                    nejsou určená pro vás, <b>nepoužívejte je</b>. Mohlo by
                    dojít k <b>poškození dat.</b>
                </AlertDescription>
            </Alert>
            <Card>
                <CardHeader>
                    <CardTitle>Prezenční listina</CardTitle>
                    <CardDescription>
                        Vygeneruje prezenční listiny pro celou akci jako PDF.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-end gap-3">
                    <Link href={"/api/attendance"} target="_blank">
                        <Button>Vygenerovat</Button>
                    </Link>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Cache</CardTitle>
                    <CardDescription>
                        Předem vypočítané a uložené mezivýsledky, které slouží k
                        urychlení ostatních operací. V případě nesrovnalostí je
                        doporučeno vynutit obnovení těchto tabulek.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-end gap-3">
                    <ServerActionButton
                        pending={archetypeInterestedPending}
                        onClick={archetypeInterested}
                    >
                        Zájem o přednášky
                    </ServerActionButton>
                    <ServerActionButton
                        pending={eventAttendingPending}
                        onClick={eventAttending}
                    >
                        Účastníci přednášek
                    </ServerActionButton>
                    <ServerActionButton
                        pending={blockArchetypeLookupPending}
                        onClick={blockArchetypeLookup}
                    >
                        Přihlášky do přednášek
                    </ServerActionButton>
                    <ServerActionButton pending={allPending} onClick={all}>
                        Vše
                    </ServerActionButton>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Počet voleb na uživatele</CardTitle>
                    <CardDescription>
                        Slouží jako ladící zobrazení pro ověření správnosti dat.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-end gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>Zobrazit</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Počet voleb na uživatele
                                </DialogTitle>
                                <DialogDescription>
                                    Slouží jako ladící zobrazení pro ověření
                                    správnosti dat.
                                    <br />
                                    <br />
                                    Pozn.: Správný stav je, pokud má uživatel 0
                                    až{" "}
                                    {configuration.secondaryClaims
                                        ? "dvojnásobek počtu bloků"
                                        : "počet bloků"}{" "}
                                    voleb v systému.
                                </DialogDescription>
                            </DialogHeader>
                            <b>Frekvence:</b>
                            <div className="grid grid-cols-[auto,auto] gap-2">
                                {Object.entries(claimsPerUserFrequency).map(
                                    ([claims, count]) => (
                                        <Fragment key={claims}>
                                            <div>{claims}</div>
                                            <div>{count}×</div>
                                        </Fragment>
                                    ),
                                )}
                            </div>
                            <Separator />
                            <b>Uživatelé:</b>
                            <div className="grid grid-cols-[auto,auto] gap-2">
                                {claimsPerUser.map((user) => (
                                    <Fragment key={user.id}>
                                        <div>{user.user}</div>
                                        <div>{user.claims}</div>
                                    </Fragment>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Rozřazení účastníků</CardTitle>
                    <CardDescription>
                        Varování: Tato akce smaže veškeré předchozí rozřazení
                        účastníků do přednášek.
                        <br />
                        <br />
                        Rozřadí účastníky do přednášek podle jejich voleb
                        případně podle toho, které přednášky mají nejméně
                        účastníků.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-end gap-3">
                    <ServerActionButton
                        variant="destructive"
                        pending={deleteAttendancesPending}
                        onClick={deleteAttendancesAction}
                    >
                        Zrušit rozřazení
                    </ServerActionButton>
                    <ServerActionButton
                        pending={generateAttendancesPending}
                        onClick={generateAttendancesAction}
                    >
                        Rozřadit účastníky
                    </ServerActionButton>
                </CardContent>
            </Card>
        </div>
    );
};

export default ClientUtilityPage;
