// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
    plugins: ["prettier-plugin-tailwindcss"],
    printWidth: 120,
    semi: false,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: "all"
};

export default config;