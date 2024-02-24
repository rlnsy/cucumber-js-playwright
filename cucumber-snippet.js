function SnippetSyntax() {
    return {
        build: function build (opts) {
            if (opts.generatedExpressions.length > 1) {
                throw new Error("sorry, I can't generate snippets for more than one cucumber expression");
            }
            const { expressionTemplate } = opts.generatedExpressions[0];
            return `
            defineStep("${expressionTemplate}", async ({ }) => {
                // ${opts.comment}
                return "pending";
            });
            `
        }
    }
}

module.exports = SnippetSyntax;
