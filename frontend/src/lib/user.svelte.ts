export const userState = $state({
	user: null as any | null,
	isLoaded: false
});

export function setUser(user: any) {
	userState.user = user;
	userState.isLoaded = true;
	if (typeof window !== 'undefined') {
		localStorage.removeItem('showAdultContent');
	}
}

export function clearUser() {
	userState.user = null;
	userState.isLoaded = true;
}
