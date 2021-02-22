export const applyMathjaxFilterToNodes = (...nodes) => {
    nodes.forEach(node => {
        Y.use('mathjax', () => {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, node]);
        });
    });
};
