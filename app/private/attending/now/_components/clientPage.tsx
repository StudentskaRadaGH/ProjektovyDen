"use client";

import { Attendance, Block } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Presentation } from "lucide-react";
import { useEffect, useState } from "react";

import SRGH from "@/components/icons/SRGH";
import { configuration } from "@/configuration/configuration";
import { getBlockName } from "@/validation/block";

interface NowClientPageProps {
    attendances: (Omit<Attendance, "user"> & { user: number })[];
    startsFrom: Block["from"] | null;
}

const NowClientPage = ({ attendances, startsFrom }: NowClientPageProps) => {
    const [currentEvent, setCurrentEvent] = useState<
        (typeof attendances)[number]["event"] | null
    >(null);
    const [nextEvent, setNextEvent] = useState<
        (typeof attendances)[number]["event"] | null
    >(null);
    const [hasStarted, setHasStarted] = useState(false);

    const recalculateEvents = () => {
        let nextEventTemp: (typeof attendances)[number]["event"] | null = null;

        attendances.forEach((attendance) => {
            if (
                attendance.event.block.from.getTime() <= Date.now() &&
                attendance.event.block.to.getTime() >= Date.now()
            )
                setCurrentEvent(attendance.event);
            else if (
                attendance.event.block.from.getTime() >= Date.now() &&
                (!nextEventTemp ||
                    attendance.event.block.from.getTime() <
                        nextEventTemp.block.from.getTime())
            )
                nextEventTemp = attendance.event;
        });

        if (nextEventTemp) setNextEvent(nextEventTemp);

        setHasStarted(
            startsFrom !== null && startsFrom.getTime() <= Date.now(),
        );
    };

    useEffect(() => {
        recalculateEvents();
        const interval = setInterval(() => {
            if (new Date().getSeconds() !== 0) return;

            recalculateEvents();
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex size-full flex-col items-center justify-center gap-10">
            {currentEvent && (
                <Card>
                    <CardHeader>
                        <CardTitle>Aktuální přednáška</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <div>
                            <Presentation className="mr-3 align-middle" />
                            {currentEvent.archetype.name}
                        </div>
                        <div>
                            <MapPin className="mr-3 align-middle" />
                            {currentEvent.place.name}
                        </div>
                        <div>
                            <Clock className="mr-3 align-middle" />
                            {getBlockName(currentEvent.block)}
                        </div>
                    </CardContent>
                </Card>
            )}
            {nextEvent && (
                <Card>
                    <CardHeader>
                        <CardTitle>Nadcházející přednáška</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <div>
                            <Presentation className="mr-3 align-middle" />
                            {nextEvent.archetype.name}
                        </div>
                        <div>
                            <MapPin className="mr-3 align-middle" />
                            {nextEvent.place.name}
                        </div>
                        <div>
                            <Clock className="mr-3 align-middle" />
                            {getBlockName(nextEvent.block)}
                        </div>
                    </CardContent>
                </Card>
            )}
            {!currentEvent &&
                !nextEvent &&
                (hasStarted ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Akce již skončila</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            Děkujeme za účast na akci! Doufáme, že jste si ji
                            užili a přejeme příjemný zbytek dne.
                            <div className="text-right">
                                {configuration.SRGHBranding ? (
                                    <>
                                        - <SRGH /> Studentská rada GH
                                    </>
                                ) : (
                                    "- Organizátoři akce"
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Akce ještě nezačala</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            Během akce zde uvidíte svůj harmonogram a další
                            informace.
                        </CardContent>
                    </Card>
                ))}
        </div>
    );
};

export default NowClientPage;
