import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import PageTemplate from "@/components/utility/PageTemplate";
import SRGH from "@/components/icons/SRGH";
import { configuration } from "@/configuration/configuration";

const AfterEnd = () => {
	return (
		<PageTemplate>
			<div className="flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500 size-full">
				<Card className="w-full">
					<CardHeader>
						<CardTitle className="text-2xl">Akce již skončila</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-4 text-center">
						<p className="text-lg">Děkujeme za účast! Doufáme, že jste si dnešní program užili.</p>
						<div className="flex justify-center mt-4 items-center gap-2 text-muted-foreground">
							{configuration.SRGHBranding ? (
								<>
									<span className="text-sm">-</span> <SRGH className="h-8 w-auto text-primary" />{" "}
									<span className="font-medium">Studentská rada GH</span>
								</>
							) : (
								<span className="italic">- Organizátoři akce</span>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</PageTemplate>
	);
};

export default AfterEnd;
