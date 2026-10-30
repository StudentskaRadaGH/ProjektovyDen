import { attendance as Attendance, asc, blocks as Blocks, db, eq } from "@/db";

import { NextPage } from "next";
import NowClientPage from "./_components/clientPage";
import { configuration } from "@/configuration/configuration";
import { getEventBlock } from "@/validation/block";
import { session } from "@/auth/session";

const NowAttendingPage: NextPage = async () => {
	const user = await session();

	if (configuration.enableScheduleSince > new Date())
		return (
			<NowClientPage
				isTooEarly={true}
				attendances={[]}
				endsAt={null}
			/>
		);

	const allBlocks = await db.query.blocks.findMany({
		orderBy: asc(Blocks.from),
	});

	const attendances = (
		await db.query.attendance.findMany({
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
		})
	)
		// Delší přednáška (dvojblok) končí až koncem posledního bloku, který zabírá
		.map((a) => ({
			...a,
			event: Object.assign({}, a.event, { block: getEventBlock(a.event.block, a.event.span, allBlocks) }),
		}))
		.sort((a, b) => a.event.block.from.getTime() - b.event.block.from.getTime());

	const endsAt = attendances.length > 0 ? attendances[attendances.length - 1].event.block.to : null;

	return (
		<NowClientPage
			attendances={attendances}
			endsAt={endsAt}
		/>
	);
};

export default NowAttendingPage;
