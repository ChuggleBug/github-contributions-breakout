/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
    trailingComma: "all",
    tabWidth: 4,
    semi: true,
    singleQuote: false,
    plugins: ["prettier-plugin-curly"],
};

export default config;
