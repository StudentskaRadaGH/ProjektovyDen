import { attendance as Attendance, db, eq } from "@/db";

import { NextPage } from "next";
import NowClientPage from "./_components/clientPage";
import { configuration } from "@/configuration/configuration";
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
	).sort((a, b) => a.event.block.from.getTime() - b.event.block.from.getTime());

	const endsAt = attendances.length > 0 ? attendances[attendances.length - 1].event.block.to : null;

	return (
		<NowClientPage
			attendances={attendances}
			endsAt={endsAt}
		/>
	);
};

export default NowAttendingPage;
