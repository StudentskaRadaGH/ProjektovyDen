import { and, count, db, eq, isNotNull, users } from "@/db";

import { Card } from "@/components/ui/card";
import { Fragment } from "react";
import { NextPage } from "next";
import PageTemplate from "@/components/utility/PageTemplate";
import { configuration } from "@/configuration/configuration";

const ClassesPage: NextPage = async () => {
	const [classesAttending, classesAll] = await Promise.all([
		db
			.select({ class: users.class, count: count(users.id) })
			.from(users)
			.where(and(eq(users.isAttending, true), isNotNull(users.class)))
			.groupBy(users.class),
		db
			.select({ class: users.class, count: count(users.id) })
			.from(users)
			.where(isNotNull(users.class))
			.groupBy(users.class),
	]);

	const lookupTableAttending: { [key: string]: number } = {};
	classesAttending.forEach((cl) => {
		if (cl.class) lookupTableAttending[cl.class] = cl.count;
	});

	let maxUsers = 0;
	const lookupTableAll: { [key: string]: number } = {};
	classesAll.forEach((cl) => {
		if (cl.class) {
			lookupTableAll[cl.class] = cl.count;
			if (cl.count > maxUsers) maxUsers = cl.count;
		}
	});

	return (
		<PageTemplate title="Statistika tříd">
			<Card className="p-4 overflow-x-auto">
				<div className="grid w-auto gap-x-4 gap-y-2 md:grid-cols-[1fr,min-content,min-content,2fr] grid-cols-[auto,min-content,min-content]">
					<b>Třída</b>
					<b className="whitespace-nowrap text-center">Účastníků</b>
					<b className="whitespace-nowrap text-center">Zaregistrovaných</b>
					<span className="hidden md:block"></span>
					{configuration.validClasses.map((c) => (
						<Fragment key={c}>
							<div className="truncate text-sm">{c}</div>
							<div className="text-center text-sm text-gray-500">{lookupTableAttending[c] ?? 0}</div>
							<div className="text-center text-sm text-gray-500">{lookupTableAll[c] ?? 0}</div>
							<div className="relative col-span-3 h-4 w-full overflow-hidden rounded-full bg-secondary md:col-span-1">
								<div
									className="absolute h-full bg-primary/20 rounded-full transition-all"
									style={{
										width: `${maxUsers > 0 ? ((lookupTableAll[c] ?? 0) / maxUsers) * 100 : 0}%`,
									}}
								/>
								<div
									className="absolute h-full bg-primary rounded-full transition-all"
									style={{
										width: `${maxUsers > 0 ? ((lookupTableAttending[c] ?? 0) / maxUsers) * 100 : 0}%`,
									}}
								/>
							</div>
						</Fragment>
					))}
				</div>
			</Card>
		</PageTemplate>
	);
};

export default ClassesPage;
