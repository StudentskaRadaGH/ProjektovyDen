import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SquareArrowOutUpRight, ThumbsUp } from "lucide-react";

import { Archetype } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import InterestButton from "./interestButton";
import { configuration } from "@/configuration/configuration";
import { pluralHelper } from "@/lib/utils";

interface SharedArchetypeElementProps {
	archetype: Archetype & { interested: number; events: number };
	canExpressInterest: {
		add: boolean;
		remove: boolean;
	};
	isInterested: boolean;
}

const SharedArchetypeElement = ({ archetype, canExpressInterest, isInterested }: SharedArchetypeElementProps) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{archetype.name}</CardTitle>
			</CardHeader>
			<CardContent className="whitespace-pre-line">
				{archetype.description}
				{archetype.detailedDescription && (
					<Dialog>
						<div className="text-center mt-5">
							<DialogTrigger className="inline-flex text-muted-foreground items-center justify-center gap-1">
								Více informací
								<SquareArrowOutUpRight />
							</DialogTrigger>
						</div>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>{archetype.name}</DialogTitle>
								<DialogDescription>Detail přednášky</DialogDescription>
							</DialogHeader>
							{archetype.detailedDescription}
						</DialogContent>
					</Dialog>
				)}
			</CardContent>
			{configuration.collectInterest && (
				<CardFooter className="flex flex-wrap justify-between gap-3">
					<Badge className="bg-yellow-500 text-black">
						<ThumbsUp />
						{archetype.interested} {pluralHelper(archetype.interested, "zájemce", "zájemci", "zájemců")}
					</Badge>
					{(canExpressInterest.add || (canExpressInterest.remove && isInterested)) && (
						<InterestButton
							archetypeId={archetype.id}
							isInterested={isInterested}
						/>
					)}
				</CardFooter>
			)}
		</Card>
	);
};

export default SharedArchetypeElement;
