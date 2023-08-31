import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const myCustomTheme: CustomThemeConfig = {
	name: 'my-custom-theme',
	properties: {
		// =~= Theme Properties =~=
		'--theme-font-family-base': 'system-ui',
		'--theme-font-family-heading': 'system-ui',
		'--theme-font-color-base': '0 0 0',
		'--theme-font-color-dark': '255 255 255',
		'--theme-rounded-base': '9999px',
		'--theme-rounded-container': '8px',
		'--theme-border-base': '1px',
		// =~= Theme On-X Colors =~=
		'--on-primary': '255 255 255',
		'--on-secondary': '0 0 0',
		'--on-tertiary': '0 0 0',
		'--on-success': '0 0 0',
		'--on-warning': '0 0 0',
		'--on-error': '255 255 255',
		'--on-surface': '255 255 255',
		// =~= Theme Colors  =~=
		// primary | #323b49
		'--color-primary-50': '224 226 228', // #e0e2e4
		'--color-primary-100': '214 216 219', // #d6d8db
		'--color-primary-200': '204 206 210', // #ccced2
		'--color-primary-300': '173 177 182', // #adb1b6
		'--color-primary-400': '112 118 128', // #707680
		'--color-primary-500': '50 59 73', // #323b49
		'--color-primary-600': '45 53 66', // #2d3542
		'--color-primary-700': '38 44 55', // #262c37
		'--color-primary-800': '30 35 44', // #1e232c
		'--color-primary-900': '25 29 36', // #191d24
		// secondary | #f4f4f4
		'--color-secondary-50': '253 253 253', // #fdfdfd
		'--color-secondary-100': '253 253 253', // #fdfdfd
		'--color-secondary-200': '252 252 252', // #fcfcfc
		'--color-secondary-300': '251 251 251', // #fbfbfb
		'--color-secondary-400': '247 247 247', // #f7f7f7
		'--color-secondary-500': '244 244 244', // #f4f4f4
		'--color-secondary-600': '220 220 220', // #dcdcdc
		'--color-secondary-700': '183 183 183', // #b7b7b7
		'--color-secondary-800': '146 146 146', // #929292
		'--color-secondary-900': '120 120 120', // #787878
		// tertiary | #30c9b5
		'--color-tertiary-50': '224 247 244', // #e0f7f4
		'--color-tertiary-100': '214 244 240', // #d6f4f0
		'--color-tertiary-200': '203 242 237', // #cbf2ed
		'--color-tertiary-300': '172 233 225', // #ace9e1
		'--color-tertiary-400': '110 217 203', // #6ed9cb
		'--color-tertiary-500': '48 201 181', // #30c9b5
		'--color-tertiary-600': '43 181 163', // #2bb5a3
		'--color-tertiary-700': '36 151 136', // #249788
		'--color-tertiary-800': '29 121 109', // #1d796d
		'--color-tertiary-900': '24 98 89', // #186259
		// success | #84cc16
		'--color-success-50': '237 247 220', // #edf7dc
		'--color-success-100': '230 245 208', // #e6f5d0
		'--color-success-200': '224 242 197', // #e0f2c5
		'--color-success-300': '206 235 162', // #ceeba2
		'--color-success-400': '169 219 92', // #a9db5c
		'--color-success-500': '132 204 22', // #84cc16
		'--color-success-600': '119 184 20', // #77b814
		'--color-success-700': '99 153 17', // #639911
		'--color-success-800': '79 122 13', // #4f7a0d
		'--color-success-900': '65 100 11', // #41640b
		// warning | #EAB308
		'--color-warning-50': '252 244 218', // #fcf4da
		'--color-warning-100': '251 240 206', // #fbf0ce
		'--color-warning-200': '250 236 193', // #faecc1
		'--color-warning-300': '247 225 156', // #f7e19c
		'--color-warning-400': '240 202 82', // #f0ca52
		'--color-warning-500': '234 179 8', // #EAB308
		'--color-warning-600': '211 161 7', // #d3a107
		'--color-warning-700': '176 134 6', // #b08606
		'--color-warning-800': '140 107 5', // #8c6b05
		'--color-warning-900': '115 88 4', // #735804
		// error | #b30000
		'--color-error-50': '244 217 217', // #f4d9d9
		'--color-error-100': '240 204 204', // #f0cccc
		'--color-error-200': '236 191 191', // #ecbfbf
		'--color-error-300': '225 153 153', // #e19999
		'--color-error-400': '202 77 77', // #ca4d4d
		'--color-error-500': '179 0 0', // #b30000
		'--color-error-600': '161 0 0', // #a10000
		'--color-error-700': '134 0 0', // #860000
		'--color-error-800': '107 0 0', // #6b0000
		'--color-error-900': '88 0 0', // #580000
		// surface | #000000
		'--color-surface-50': '217 217 217', // #d9d9d9
		'--color-surface-100': '204 204 204', // #cccccc
		'--color-surface-200': '191 191 191', // #bfbfbf
		'--color-surface-300': '153 153 153', // #999999
		'--color-surface-400': '77 77 77', // #4d4d4d
		'--color-surface-500': '0 0 0', // #000000
		'--color-surface-600': '0 0 0', // #000000
		'--color-surface-700': '0 0 0', // #000000
		'--color-surface-800': '0 0 0', // #000000
		'--color-surface-900': '0 0 0' // #000000
	}
};
