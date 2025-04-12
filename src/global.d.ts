declare interface Window {
	cordova?: Cordova | undefined;
}

interface Cordova {
	plugins: CordovaPlugins;
}

interface CordovaPlugins {
	health: CordovaHealthPlugin;
}

interface CordovaHealthPlugin {
	/**
	 * Check if the health data API is available
	 * @param successCallback Function to call on success (receives boolean argument)
	 * @param errorCallback Function to call on error
	 */
	isAvailable(
		successCallback: (available: boolean) => void,
		errorCallback: (error: string) => void
	): void;

	/**
	 * Check if the app has authorization to read/write a set of datatypes
	 * @param datatypes Health data types to check authorization for
	 * @param successCallback Function to call on success (receives boolean argument indicating if authorized)
	 * @param errorCallback Function to call on error
	 */
	isAuthorized(
		datatypes: HealthDataType,
		successCallback: (authorized: boolean) => void,
		errorCallback: (error: string) => void
	): void;

	/**
	 * Request authorization for reading/writing health data
	 * @param datatypes Health data types to request access to
	 * @param successCallback Function to call on success
	 * @param errorCallback Function to call on error
	 */
	requestAuthorization(
		datatypes: HealthDataType,
		successCallback: (success: string) => void,
		errorCallback: (error: string) => void
	): void;

	/**
	 * Query for health data
	 * @param queryOptions Options for the query
	 * @param successCallback Function to call on success
	 * @param errorCallback Function to call on error
	 */
	query(
		queryOptions: HealthQueryOptions,
		successCallback: (data: HealthData[]) => void,
		errorCallback: (error: string) => void
	): void;

	/**
	 * Store health data
	 * @param storeOptions Options for storing health data
	 * @param successCallback Function to call on success
	 * @param errorCallback Function to call on error
	 */
	store(
		storeOptions: HealthStoreOptions,
		successCallback: () => void,
		errorCallback: (error: string) => void
	): void;

	/**
	 * Delete health data
	 * @param deleteOptions Options for deleting health data
	 * @param successCallback Function to call on success
	 * @param errorCallback Function to call on error
	 */
	delete(
		deleteOptions: HealthDeleteOptions,
		successCallback: () => void,
		errorCallback: (error: string) => void
	): void;
}

type HealthDataType = {
	read: string[];
	write: string[];
};

interface HealthQueryOptions {
	startDate: Date | string;
	endDate: Date | string;
	dataType: string;
	limit?: number;
	aggregated?: boolean;
	bucketType?: string;
	bucketInterval?: number;
}

interface HealthStoreOptions {
	dataType: string;
	value: number;
	startDate: Date | string;
	endDate: Date | string;
	sourceName?: string;
	sourceBundleId?: string;
}

interface HealthDeleteOptions {
	dataType: string;
	startDate: Date | string;
	endDate: Date | string;
}

interface HealthData {
	startDate: string;
	endDate: string;
	value: number;
	unit: string;
	sourceName?: string;
	sourceBundleId?: string;
	dataType: string;
}
