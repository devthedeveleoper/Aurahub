<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fetchApi } from '#lib/api';
	import VideoThumbnail from '#lib/components/VideoThumbnail.svelte';
	import WatchLaterButton from '#lib/components/WatchLaterButton.svelte';
	import { ShieldAlert, Play, ShieldCheck, ArrowLeft, LogOut } from 'lucide-svelte';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { Skeleton } from '#lib/components/ui/skeleton';
	import { Button } from '#lib/components/ui/button';
	import { consentState, initAdultConsent, grantAdultConsent, revokeAdultConsent } from '#lib/consent.svelte';

	const queryClient = useQueryClient();

	let currentPage = $derived(Number(page.url.searchParams.get('page')) || 1);
	const limit = 12;

	onMount(() => {
		initAdultConsent();
	});

	let query = createQuery(
		() => ({
			queryKey: ['adult-videos', currentPage, limit, consentState.hasConsent],
			queryFn: async () => {
				if (!consentState.hasConsent) {
					return { videos: [], total: 0, totalPages: 1 };
				}
				const res = await fetchApi(`/videos?type=standard&adult=true&page=${currentPage}&limit=${limit}`);
				return res;
			},
			enabled: consentState.hasConsent
		}),
		() => queryClient
	);

	function goToPage(p: number) {
		const totalPages = query.data?.totalPages || 1;
		if (p < 1 || p > totalPages) return;
		const url = new URL(page.url.href);
		url.searchParams.set('page', p.toString());
		goto(url.toString());
	}

	function getVisiblePages(current: number, total: number) {
		let start = Math.max(1, current - 2);
		let end = Math.min(total, current + 2);

		if (current <= 3) {
			end = Math.min(total, 5);
		}
		if (current >= total - 2) {
			start = Math.max(1, total - 4);
		}

		const pages = [];
		for (let i = start; i <= end; i++) {
			pages.push(i);
		}
		return pages;
	}

	function handleExitAdultZone() {
		revokeAdultConsent();
		goto('/');
	}
</script>

<svelte:head>
	<title>18+ Adult Hub - Aurahub</title>
</svelte:head>

{#if !consentState.hasConsent}
	<!-- Age Gate & Consent Screen -->
	<div class="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
		<div class="w-full rounded-3xl border border-amber-500/30 bg-card p-8 shadow-2xl backdrop-blur-xl sm:p-12">
			<div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
				<ShieldAlert class="h-10 w-10" />
			</div>

			<div class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-500 dark:text-amber-400 mb-3">
				<span class="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
				Age Restricted Section
			</div>

			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
				18+ Adult Content Hub
			</h1>

			<p class="text-muted-foreground mt-4 text-sm leading-relaxed sm:text-base">
				This isolated section contains mature and sexually explicit videos. It is strictly kept separate from all general videos, search, and home recommendations.
			</p>

			<p class="text-muted-foreground mt-2 text-xs">
				You must be at least 18 years of age (or legal age of majority in your jurisdiction) to proceed.
			</p>

			<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
				<Button
					variant="outline"
					size="lg"
					class="w-full rounded-full sm:w-auto"
					onclick={() => goto('/')}
				>
					<ArrowLeft class="mr-2 h-4 w-4" />
					Return to General Feed
				</Button>
				<Button
					size="lg"
					class="w-full rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 sm:w-auto font-semibold"
					onclick={() => grantAdultConsent()}
				>
					<ShieldCheck class="mr-2 h-4 w-4" />
					I am 18+ — Enter 18+ Hub
				</Button>
			</div>
		</div>
	</div>
{:else}
	<!-- Consented Isolated Adult Feed -->
	<div class="space-y-6">
		<!-- Isolation Banner -->
		<div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
					<ShieldAlert class="h-5 w-5" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-lg font-bold sm:text-xl">18+ Adult Zone</h1>
						<span class="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-500">Isolated View</span>
					</div>
					<p class="text-muted-foreground text-xs sm:text-sm">
						This feed is strictly isolated from general videos.
					</p>
				</div>
			</div>
			<Button
				variant="outline"
				size="sm"
				class="rounded-full border-amber-500/30 hover:bg-amber-500/10"
				onclick={handleExitAdultZone}
			>
				<LogOut class="mr-2 h-3.5 w-3.5" />
				Exit 18+ Zone
			</Button>
		</div>

		{#if query.isPending}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each Array(8) as _}
					<div class="flex animate-pulse flex-col space-y-3">
						<Skeleton class="aspect-video w-full rounded-xl" />
						<div class="flex gap-3">
							<Skeleton class="h-10 w-10 shrink-0 rounded-full" />
							<div class="w-full space-y-2">
								<Skeleton class="h-4 w-3/4 rounded" />
								<Skeleton class="h-3 w-1/2 rounded" />
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else if query.isError}
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<div class="bg-destructive/10 text-destructive rounded-xl p-4">
					<p>{query.error.message}</p>
					<Button variant="outline" class="mt-4" onclick={() => query.refetch()}>Try again</Button>
				</div>
			</div>
		{:else if !query.data?.videos || query.data.videos.length === 0}
			<div
				class="border-muted-foreground/20 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-24 text-center"
			>
				<Play class="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
				<h2 class="mb-2 text-xl font-semibold">No adult videos found</h2>
				<p class="text-muted-foreground max-w-sm">
					No mature videos currently in this section.
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each (query.data.videos || []).filter((v: any) => !v.isShort) as video}
					<a href={`/watch/${video.fileId}`} class="group flex flex-col space-y-3">
						<VideoThumbnail
							{video}
							class="aspect-video rounded-xl"
							imgClass="transition-transform duration-300 group-hover:scale-105"
						>
							<WatchLaterButton videoId={video.id} />
						</VideoThumbnail>
						<div class="flex gap-3">
							<img
								src={video.uploader_avatar ||
									`https://api.dicebear.com/7.x/identicon/svg?seed=${video.uploader_username}`}
								alt={video.uploader_username}
								class="bg-muted h-10 w-10 shrink-0 rounded-full object-cover"
							/>
							<div class="flex flex-col overflow-hidden">
								<h3
									class="line-clamp-2 text-sm leading-tight font-semibold transition-colors group-hover:text-primary"
								>
									{video.title}
								</h3>
								<div class="text-muted-foreground mt-1 space-y-0.5 text-xs">
									<p class="transition-colors hover:text-primary">{video.uploader_username}</p>
									<div class="flex items-center gap-1">
										<span>{video.views || 0} views</span>
									</div>
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>

			<!-- Pagination -->
			{#if query.data && query.data.totalPages > 1}
				<div class="flex items-center justify-center gap-2 pt-6 pb-12">
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage <= 1}
						onclick={() => goToPage(currentPage - 1)}
					>
						Previous
					</Button>
					{#each getVisiblePages(currentPage, query.data.totalPages) as p}
						<Button
							variant={p === currentPage ? 'default' : 'outline'}
							size="sm"
							class="h-9 w-9 p-0"
							onclick={() => goToPage(p)}
						>
							{p}
						</Button>
					{/each}
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage >= query.data.totalPages}
						onclick={() => goToPage(currentPage + 1)}
					>
						Next
					</Button>
				</div>
			{/if}
		{/if}
	</div>
{/if}
