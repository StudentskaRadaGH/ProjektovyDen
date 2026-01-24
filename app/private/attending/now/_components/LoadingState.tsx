import PageTemplate from "@/components/utility/PageTemplate";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { configuration } from "@/configuration/configuration";

const LoadingState = () => {
	return (
		<PageTemplate title={configuration.showEntireSchedule ? "Váš harmonogram" : "Právě teď"}>
			<div
				className={cn(
					"mx-auto w-full",
					configuration.showEntireSchedule ? "max-w-3xl space-y-4" : "flex max-w-xl flex-col gap-6",
				)}>
				{configuration.showEntireSchedule ? (
					Array.from({ length: 2 }).map((_, i) => (
						<Skeleton
							key={i}
							className="h-48 w-full rounded-xl"
						/>
					))
				) : (
					<>
						<div className="space-y-2">
							<div>
								<Skeleton className="h-6 w-32" />
							</div>
							<Skeleton className="h-48 w-full rounded-xl" />
						</div>
						<Separator />
						<div className="space-y-2 pt-2">
							<Skeleton className="h-6 w-24" />
							<Skeleton className="h-24 w-full rounded-xl" />
						</div>
					</>
				)}
			</div>
		</PageTemplate>
	);
};

export default LoadingState;
