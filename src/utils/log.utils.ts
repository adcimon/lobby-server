export namespace LogUtils {
	export const WHITE_COLOR: string = '\x1b[0m';
	export const GREEN_COLOR: string = '\x1b[32m';
	export const YELLOW_COLOR: string = '\x1b[33m';
	export const RED_COLOR: string = '\x1b[31m';
	export const CYAN_COLOR: string = '\x1b[36m';
	export const BASE_COLOR: string = WHITE_COLOR;

	export const message = (tag: string, message?: string): string => {
		return `${CYAN_COLOR}${tag}${BASE_COLOR} ${message}`;
	};

	export const success = (tag: string, message?: string): string => {
		return `${GREEN_COLOR}${tag}${BASE_COLOR} ${message}`;
	};

	export const warning = (tag: string, message?: string): string => {
		return `${YELLOW_COLOR}${tag}${BASE_COLOR} ${message}`;
	};

	export const error = (tag: string, message?: string): string => {
		return `${RED_COLOR}${tag}${BASE_COLOR} ${message}`;
	};
}
