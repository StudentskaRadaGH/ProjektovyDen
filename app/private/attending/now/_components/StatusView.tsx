import { CalendarDays, Clock, MapPin, Presentation } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Attendance } from "@/lib/types";
import PageTemplate from "@/components/utility/PageTemplate";
import { Separator } from "@/components/ui/separator";
import { getBlockName } from "@/validation/block";
import { printTime } from "@/lib/utils";

type AttendanceItem = Omit<Attendance, "user"> & { user: number };

interface StatusViewProps {
	currentEvent?: AttendanceItem;
	nextEvent?: AttendanceItem;
}

const StatusView = ({ currentEvent, nextEvent }: StatusViewProps) => {
	return (
		<PageTemplate title="Právě teď">
			<div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
				{currentEvent ? (
					<div
						className="animate-in fade-in zoom-in-90 duration-500"
						key={currentEvent.id}>
						<div className="mb-2">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<Presentation className="h-5 w-5 text-primary" />
								Aktuální akce
							</h3>
						</div>
						<Card className="border-primary shadow-lg bg-gradient-to-br from-card to-primary/5">
							<CardHeader>
								<CardTitle className="text-2xl sm:text-3xl tracking-tight">
									{currentEvent.event.archetype.name}
								</CardTitle>
								<CardDescription className="text-base sm:text-lg text-foreground/80 font-medium">
									{printTime(currentEvent.event.block.from)} -{" "}
									{printTime(currentEvent.event.block.to)}, {currentEvent.event.place.name}
								</CardDescription>
							</CardHeader>
							<Separator className="-mt-3 mb-3 w-[calc(100%-3rem)] mx-auto" />
							<CardContent>
								{currentEvent.event.archetype.description && (
									<p className="text-muted-foreground text-sm">
										{currentEvent.event.archetype.description}
									</p>
								)}
							</CardContent>
						</Card>
					</div>
				) : (
					<div className="animate-in fade-in zoom-in-90 duration-500">
						<Card className="border-dashed bg-muted/30">
							<CardHeader className="text-center py-8">
								<CardTitle className="text-xl">Právě teď máte volno</CardTitle>
								<CardDescription>Momentálně nemáte zapsanou žádnou akci.</CardDescription>
							</CardHeader>
						</Card>
					</div>
				)}

				<Separator />

				{nextEvent ? (
					<div
						className="animate-in fade-in zoom-in-90 duration-500"
						key={nextEvent.id}>
						<div className="mb-2">
							<h3 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
								<CalendarDays className="h-5 w-5" />
								Následuje
							</h3>
						</div>
						<Card className="hover:bg-accent/50 transition-colors cursor-default">
							<CardHeader>
								<CardTitle className="text-xl">{nextEvent.event.archetype.name}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-2 text-muted-foreground mb-4">
									<Clock className="h-5 w-5" />
									<span>{getBlockName(nextEvent.event.block)}</span>
								</div>
								<div className="flex items-center gap-2 text-muted-foreground">
									<MapPin className="h-4 w-4" />
									{nextEvent.event.place.name}
								</div>
							</CardContent>
						</Card>
					</div>
				) : (
					<div className="text-center p-4 text-muted-foreground animate-in fade-in zoom-in-90 duration-500">
						<p>Toto byla vaše poslední akce.</p>
					</div>
				)}
			</div>
		</PageTemplate>
	);
};

export default StatusView;
