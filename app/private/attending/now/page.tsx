import { attendance as Attendance, blocks as Blocks, asc, db, eq } from "@/db";

import { NextPage } from "next";
import NowClientPage from "./_components/clientPage";
import PageTemplate from "@/components/utility/PageTemplate";
import { session } from "@/auth/session";

const NowAttendingPage: NextPage = async () => {
    const user = await session();

    const attendances = await db.query.attendance.findMany({
        where: eq(Attendance.user, user.id),
        with: {
            event: {
                with: {
                    archetype: true,
                    block: true,
                    place: true,
                },
            },
        },
    });

    const startsFrom =
        (
            await db.query.blocks.findFirst({
                orderBy: asc(Blocks.from),
                columns: {
                    from: true,
                },
            })
        )?.from ?? null;

    return (
        <PageTemplate>
            <NowClientPage attendances={attendances} startsFrom={startsFrom} />
        </PageTemplate>
    );
};

export default NowAttendingPage;
