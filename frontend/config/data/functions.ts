export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
export const tanh = (x: number) =>
  (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
export const relu = (x: number) => (x >= 0 ? x : 0); // ReLU classique (sans fuite)
export const swish = (x: number) => x * sigmoid(x);
export const softmax = (x: number, arr: number[] = [-2, -1, 0, 1, 2]) => {
  const exps = arr.map((v) => Math.exp(v));
  const sum = exps.reduce((a, b) => a + b, 0);
  return Math.exp(x) / sum;
};
export const gelu = (x: number) =>
  0.5 *
  x *
  (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))));
export const softplus = (x: number) => Math.log(1 + Math.exp(x));
export const selu = (x: number) => {
  const alpha = 1.6732632423543772;
  const scale = 1.0507009873554805;
  return scale * (x > 0 ? x : alpha * (Math.exp(x) - 1));
};
export const elu = (x: number) => (x >= 0 ? x : Math.exp(x) - 1);
export const mish = (x: number) => x * Math.tanh(softplus(x));
export const softsign = (x: number) => x / (1 + Math.abs(x));
export const linear = (x: number) => x;
export const exponential = (x: number) => Math.exp(x);


export const ACTIVATIONS_FUNCTION: Record<string,{
  func: (x: number) => number;
  domainX: string;
  domainY: string;
  equation: string;
}> = {
  "sigmoid": {
    func: sigmoid,
    domainX: "[-∞; +∞]",
    domainY: "[0; 1]",
    equation: "$$\\sigma(x) = \\frac{1}{1 + e^{-x}}$$",
  },
  "tanh": {
    func: tanh,
    domainX: "[-∞; +∞]",
    domainY: "[-1; 1]",
    equation: "$$\\tanh(x) = \\frac{e^x - e^{-x}}{e^x + e^{-x}}$$",
  },
  "relu": {
    func: relu,
    domainX: "[-∞; +∞]",
    domainY: "[0; +∞[",
    equation: "$$\\text{ReLU}(x) = \\max(0, x)$$",
  },
  "swish": {
    func: swish,
    domainX: "[-∞; +∞]",
    domainY: "[-0.278; +∞[",
    equation:
      "$$\\text{Swish}(x) = x \\cdot \\sigma(x) = \\frac{x}{1 + e^{-x}}$$",
  },
  "softmax": {
    func: softmax,
    domainX: "[-∞; +∞] vecteur",
    domainY: "]0; 1[",
    equation: "$$\\text{Softmax}(x_i) = \\frac{e^{x_i}}{\\sum_j e^{x_j}}$$",
  },
  "gelu": {
    func: gelu,
    domainX: "[-∞; +∞]",
    domainY: "[-∞; +∞]",
    equation:
      "$$\\text{GELU}(x) = 0.5 x \\left(1 + \\tanh\\left[\\sqrt{2/\\pi} (x + 0.044715 x^3)\\right]\\right)$$",
  },
  "softplus": {
    func: softplus,
    domainX: "[-∞; +∞]",
    domainY: "[0; +∞[",
    equation: "$$\\text{Softplus}(x) = \\ln(1 + e^x)$$",
  },
  "selu": {
    func: selu,
    domainX: "[-∞; +∞]",
    domainY: "[-1.76; +∞[",
    equation:
      "$$\\text{SELU}(x) = \\lambda \\begin{cases} x & x > 0 \\\\ \\alpha(e^x - 1) & x \\le 0 \\end{cases}$$",
  },
  "elu": {
    func: elu,
    domainX: "[-∞; +∞]",
    domainY: "]-1; +∞[",
    equation:
      "$$\\text{ELU}(x) = \\begin{cases} x & x \\ge 0 \\\\ e^x - 1 & x < 0 \\end{cases}$$",
  },
  "mish": {
    func: mish,
    domainX: "[-∞; +∞]",
    domainY: "[-0.31; +∞[",
    equation: "$$\\text{Mish}(x) = x \\cdot \\tanh(\\ln(1 + e^x))$$",
  },
  "softsign": {
    func: softsign,
    domainX: "[-∞; +∞]",
    domainY: "]-1; 1[",
    equation: "$$\\text{Softsign}(x) = \\frac{x}{1 + |x|}$$",
  },
  "linear": {
    func: linear,
    domainX: "[-∞; +∞]",
    domainY: "[-∞; +∞]",
    equation: "$$\\text{Linear}(x) = x$$",
  },
  "exponential": {
    func: exponential,
    domainX: "[-∞; +∞]",
    domainY: "]0; +∞[",
    equation: "$$\\exp(x) = e^x$$",
  }
}