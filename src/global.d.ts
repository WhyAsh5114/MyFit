declare interface Window {
	ReactNativeWebView?: {
		postMessage: (message: string) => void;
	};
}
