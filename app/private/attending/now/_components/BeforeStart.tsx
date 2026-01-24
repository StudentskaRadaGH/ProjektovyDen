import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { printDate, printTime } from "@/lib/utils";

import { CalendarDays } from "lucide-react";
import PageTemplate from "@/components/utility/PageTemplate";

interface BeforeStartProps {
	startTime: Date;
}

const BeforeStart = ({ startTime }: BeforeStartProps) => {
	return (
		<PageTemplate>
			<div className="flex flex-col items-center justify-center p-6 text-center size-full">
				<Card className="w-full max-w-md shadow-lg">
					<CardHeader>
						<CardTitle className="flex flex-col items-center justify-center gap-4">
							<CalendarDays className="h-12 w-12" />
							<span>Jste moc brzy</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-lg text-muted-foreground">
							Váš harmonogram se zde zobrazí{" "}
							<span
								suppressHydrationWarning
								className="font-semibold text-foreground">
								{printDate(startTime)} v {printTime(startTime)}
							</span>
							.
						</p>
					</CardContent>
				</Card>
			</div>
		</PageTemplate>
	);
};

export default BeforeStart;
