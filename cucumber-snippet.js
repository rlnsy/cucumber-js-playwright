function SnippetSyntax() {
    return {
        build: function build (opts) {
            if (opts.generatedExpressions.length > 1) {
                throw new Error("sorry, I can't generate snippets for more than one cucumber expression");
            }
            let { expressionTemplate, parameterTypes } = opts.generatedExpressions[0];
            parameterTypes.forEach(({ name }, i) => {
                expressionTemplate = expressionTemplate.replace(new RegExp(`\\{${i}\\}`, "g"), name);
            })
            return `
            ${opts.functionName}("${expressionTemplate}", async ({ }) => {
                // ${opts.comment}
                return "pending";
            });
            `
        }
    }
}

module.exports = SnippetSyntax;
