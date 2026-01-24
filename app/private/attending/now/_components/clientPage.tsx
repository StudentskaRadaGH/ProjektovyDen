"use client";

import { useEffect, useState } from "react";

import AfterEnd from "./AfterEnd";
import { Attendance } from "@/lib/types";
import BeforeStart from "./BeforeStart";
import LoadingState from "./LoadingState";
import { RefreshCurrentPath } from "@/actions/refresh";
import ScheduleView from "./ScheduleView";
import StatusView from "./StatusView";
import { configuration } from "@/configuration/configuration";

interface NowClientPageProps {
	isTooEarly?: boolean;
	attendances: (Omit<Attendance, "user"> & { user: number })[];
	endsAt: Date | null;
}

const NowClientPage = ({ isTooEarly, attendances, endsAt }: NowClientPageProps) => {
	const [nowTime, setNowTime] = useState<number | null>(null);

	useEffect(() => {
		setNowTime(Date.now());

		const interval = setInterval(() => {
			const nowTime = Date.now();

			if (isTooEarly && nowTime >= configuration.enableScheduleSince.getTime()) RefreshCurrentPath();

			setNowTime(nowTime);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	if (!nowTime) return <LoadingState />;

	const startTime = configuration.enableScheduleSince;
	const endTime = endsAt;

	if (nowTime < startTime.getTime()) return <BeforeStart startTime={startTime} />;

	if (isTooEarly) return <LoadingState />;

	if (endTime && nowTime > endTime.getTime()) return <AfterEnd />;

	const currentEvent = attendances.find(
		(a) => a.event.block.from.getTime() <= nowTime && a.event.block.to.getTime() >= nowTime,
	);

	if (configuration.showEntireSchedule)
		return (
			<ScheduleView
				attendances={attendances}
				currentEvent={currentEvent}
				nowTime={nowTime}
			/>
		);

	const nextEvent = attendances.find((a) => a.event.block.from.getTime() > nowTime);

	return (
		<StatusView
			currentEvent={currentEvent}
			nextEvent={nextEvent}
		/>
	);
};

export default NowClientPage;
