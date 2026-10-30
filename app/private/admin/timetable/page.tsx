import { archetypes as Archetypes, blocks as Blocks, asc, db } from "@/db";

import EventDetails from "./_components/eventDetails";
import { Fragment } from "react";
import { NextPage } from "next";
import PageTemplate from "@/components/utility/PageTemplate";
import { getBlockName } from "@/validation/block";

const TimetablePage: NextPage = async () => {
    const archetypes = await db.query.archetypes.findMany({
        orderBy: asc(Archetypes.name),
        with: {
            events: {
                with: {
                    place: true,
                    attendances: {
                        columns: {
                            id: true,
                        },
                        with: {
                            user: {
                                columns: {
                                    id: true,
                                    name: true,
                                    colors: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const blocks = await db.query.blocks.findMany({
        orderBy: Blocks.from,
    });

    return (
        <PageTemplate title="Rozvrh">
            <div
                className="width-full grid items-center justify-items-center overflow-auto rounded-2xl"
                style={{
                    gridTemplateColumns:
                        "max-content" + " 1fr".repeat(blocks.length),
                }}
            >
                <span className="size-full bg-primary" />
                {blocks.map((block) => (
                    <div
                        className="size-full text-nowrap bg-primary p-4 text-center font-bold text-primary-foreground"
                        key={block.id}
                    >
                        {getBlockName(block)}
                    </div>
                ))}
                {archetypes.map((archetype) => (
                    <Fragment key={archetype.id}>
                        <div className="flex size-full max-w-80 items-center bg-secondary px-4 py-2 text-secondary-foreground">
                            {archetype.name}
                        </div>
                        {blocks.map((block, blockIndex) => {
                            const blockEvents = archetype.events.filter(
                                (e) => e.block === block.id,
                            );

                            // Blok je zabrán delší přednáškou z předchozího bloku
                            const isCovered = archetype.events.some((e) => {
                                const startIndex = blocks.findIndex(
                                    (b) => b.id === e.block,
                                );

                                return (
                                    startIndex < blockIndex &&
                                    startIndex + e.span > blockIndex
                                );
                            });

                            if (isCovered) return null;

                            const span = Math.max(
                                1,
                                ...blockEvents.map((e) => e.span),
                            );

                            return (
                                <div
                                    key={block.id}
                                    style={{
                                        gridColumn: `span ${Math.min(span, blocks.length - blockIndex)}`,
                                    }}
                                >
                                    {blockEvents.map((event) => (
                                        <EventDetails
                                            key={event.id}
                                            event={event}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </Fragment>
                ))}
            </div>
        </PageTemplate>
    );
};

export default TimetablePage;
