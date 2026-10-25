// SPDX-FileCopyrightText: 2022 Johannes Loher
// SPDX-FileCopyrightText: 2022 David Archibald
//
// SPDX-License-Identifier: MIT

import { nodeResolve } from "@rollup/plugin-node-resolve";

export default () => ({
	input: "src/module.js",
	output: {
		dir: "dist",
		format: "es",
		sourcemap: true,
	},
	plugins: [nodeResolve()],
});
