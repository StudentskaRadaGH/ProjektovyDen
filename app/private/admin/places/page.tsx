import { Archetype, Block, Event, Place } from "@/lib/types";
import { asc, db, events, places as placesTable } from "@/db";

import { NextPage } from "next";
import PlacesClientPage from "./_components/clientPage";

export type EditPlaceInfo = Place & {
    events: {
        id: Event["id"];
        archetype: Pick<Archetype, "name">;
        block: Pick<Block, "from" | "to">;
        capacity: Event["capacity"];
        attending: number;
    }[];
};

const PlacesPage: NextPage = async () => {
    const places: EditPlaceInfo[] = await db.query.places.findMany({
        with: {
            events: {
                columns: {
                    id: true,
                    capacity: true,
                    attending: true,
                },
                with: {
                    archetype: {
                        columns: {
                            name: true,
                        },
                    },
                    block: {
                        columns: {
                            from: true,
                            to: true,
                        },
                    },
                },
                orderBy: asc(events.capacity),
            },
        },
        orderBy: asc(placesTable.name),
    });

    return <PlacesClientPage places={places} />;
};

export default PlacesPage;
