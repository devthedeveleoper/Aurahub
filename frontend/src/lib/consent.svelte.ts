// Adult Content Consent Manager (Svelte 5 runes)

export const consentState = $state({
	hasConsent: false,
	isLoaded: false
});

export function initAdultConsent() {
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem('aurahub_adult_consent');
		consentState.hasConsent = stored === 'true';
		consentState.isLoaded = true;
	}
}

export function grantAdultConsent() {
	if (typeof window !== 'undefined') {
		localStorage.setItem('aurahub_adult_consent', 'true');
	}
	consentState.hasConsent = true;
}

export function revokeAdultConsent() {
	if (typeof window !== 'undefined') {
		localStorage.removeItem('aurahub_adult_consent');
	}
	consentState.hasConsent = false;
}
