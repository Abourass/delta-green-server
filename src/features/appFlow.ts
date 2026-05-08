export type AppFlowState =
	| 'login'
	| 'welcome'
	| 'decrypting'
	| 'navigation'
	| 'preamble'
	| 'axioms';

export type AppFlowAction =
	| 'loginSucceeded'
	| 'welcomeCompleted'
	| 'decryptingCompleted'
	| 'openCorrespondence'
	| 'openAxioms'
	| 'returnToNavigation';

export const INITIAL_APP_FLOW_STATE: AppFlowState = 'login';
export const FIRST_AXIOM_PAGE = 1;
export const TOTAL_AXIOM_PAGES = 9;

const appFlowTransitions: Record<AppFlowState, Partial<Record<AppFlowAction, AppFlowState>>> = {
	login: {
		loginSucceeded: 'welcome'
	},
	welcome: {
		welcomeCompleted: 'decrypting'
	},
	decrypting: {
		decryptingCompleted: 'navigation'
	},
	navigation: {
		openCorrespondence: 'preamble'
	},
	preamble: {
		openAxioms: 'axioms'
	},
	axioms: {
		returnToNavigation: 'navigation'
	}
};

export const transitionAppFlow = (state: AppFlowState, action: AppFlowAction): AppFlowState =>
	appFlowTransitions[state][action] ?? state;

export const nextWrappedPage = (
	page: number,
	totalPages: number = TOTAL_AXIOM_PAGES,
	firstPage: number = FIRST_AXIOM_PAGE
) => (page >= totalPages ? firstPage : page + 1);

export const prevWrappedPage = (
	page: number,
	totalPages: number = TOTAL_AXIOM_PAGES,
	firstPage: number = FIRST_AXIOM_PAGE
) => (page <= firstPage ? totalPages : page - 1);
