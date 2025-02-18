import { MetadataRoute } from "next";
import { configuration } from "@/configuration/configuration";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: configuration.appName,
		short_name: configuration.appShortName ?? configuration.appName,
		description: configuration.appDescription,
		start_url: "/",
		orientation: "portrait",
		display: "standalone",
		theme_color: configuration.appThemeColor,
		background_color: configuration.appThemeColor,
		icons: [
			{
				src: "/icons/icon-192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/icons/icon-512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
		screenshots: [
			{
				src: "/icons/icon-512.png",
				sizes: "512x512",
				type: "image/png",
			},
			{
				src: "/icons/icon-512.png",
				sizes: "512x512",
				type: "image/png",
				form_factor: "wide",
			},
		],
	};
}
