const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const tanh = (x: number) =>
  (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
const relu = (x: number) => (x >= 0 ? x : 0); // ReLU classique (sans fuite)
const swish = (x: number) => x * sigmoid(x);
const softmax = (x: number, arr: number[] = [-2, -1, 0, 1, 2]) => {
  const exps = arr.map((v) => Math.exp(v));
  const sum = exps.reduce((a, b) => a + b, 0);
  return Math.exp(x) / sum;
};
const gelu = (x: number) =>
  0.5 *
  x *
  (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))));
const softplus = (x: number) => Math.log(1 + Math.exp(x));
const selu = (x: number) => {
  const alpha = 1.6732632423543772;
  const scale = 1.0507009873554805;
  return scale * (x > 0 ? x : alpha * (Math.exp(x) - 1));
};
const elu = (x: number) => (x >= 0 ? x : Math.exp(x) - 1);
const mish = (x: number) => x * Math.tanh(softplus(x));
const softsign = (x: number) => x / (1 + Math.abs(x));
const linear = (x: number) => x;
const exponential = (x: number) => Math.exp(x);

export {sigmoid, tanh, relu, swish, softmax, gelu, softplus, selu, elu, mish, softsign, linear, exponential} // fonction d'activation
