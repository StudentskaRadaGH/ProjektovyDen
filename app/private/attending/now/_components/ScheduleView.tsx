import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";

import { Attendance } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import PageTemplate from "@/components/utility/PageTemplate";
import { cn } from "@/lib/utils";
import { getBlockName } from "@/validation/block";

type AttendanceItem = Omit<Attendance, "user"> & { user: number };

interface ScheduleViewProps {
	attendances: AttendanceItem[];
	currentEvent?: AttendanceItem;
	nowTime: number;
}

const ScheduleView = ({ attendances, currentEvent, nowTime }: ScheduleViewProps) => {
	return (
		<PageTemplate title="Váš harmonogram">
			<div className="space-y-4 max-w-3xl mx-auto">
				{attendances.length === 0 && (
					<div className="text-muted-foreground text-center py-10 bg-muted/30 rounded-lg border-dashed border-2">
						Nemáte žádné zapsané přednášky.
					</div>
				)}

				{attendances.map((item) => {
					const toTime = item.event.block.to.getTime();

					const isCurrent = currentEvent?.id === item.id;
					const isPast = toTime < nowTime;

					return (
						<Card
							key={item.id}
							className={cn("transition-all duration-300 border-l-[6px]", {
								"border-primary bg-primary/5 shadow-md": isCurrent,
								"hover:bg-muted/50": !isCurrent,
								"opacity-40": isPast,
							})}>
							<CardHeader className="p-4">
								<div className="flex flex-col gap-3">
									<div className="shrink-0 ">
										{isCurrent && (
											<Badge className="bg-primary hover:bg-primary/90">Právě probíhá</Badge>
										)}
										{isPast && <Badge variant="secondary">Proběhlo</Badge>}
										{!isCurrent && !isPast && <Badge variant="outline">Nadcházející</Badge>}
									</div>
									<div>
										<CardTitle className={cn("text-xl", isCurrent && "text-primary")}>
											{item.event.archetype.name}
										</CardTitle>
										<CardDescription className="line-clamp-2 mt-1">
											{item.event.archetype.description}
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="p-4 pt-0">
								<div className="flex flex-col gap-2 text-sm text-muted-foreground">
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4" />
										<span
											suppressHydrationWarning
											className="font-medium">
											{getBlockName(item.event.block)}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<MapPin className="h-4 w-4" />
										<span className="font-medium">{item.event.place.name}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</PageTemplate>
	);
};

export default ScheduleView;
