# 🧠 Neural Network Visualizer

An interactive, browser-based neural network visualization tool for understanding how neural networks learn to fit functions.

![Neural Network Visualizer](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

### 🎨 Visual Network Graph
- **Dynamic Node Sizing** - Nodes grow/shrink based on bias changes
- **Dynamic Edge Thickness** - Edges thicken/thin based on weight changes
- **Delta Coloring** - Green = increased, Red = decreased from initial values
- **Reference Circles** - White dashed circles show original node sizes
- **Weight Labels** - All edges display `initial→current` weight values

### 📊 Real-time Charts
- **Curve Fitting** - See how the network output matches the target function
- **Loss Chart** - Track training loss over epochs
- **Accuracy Chart** - Monitor accuracy percentage in real-time

### 🔬 Visual Forward Pass
Expand the Forward Pass panel to see a beautiful **graph-based visualization** showing:
- Input value flowing through the network
- Weights multiplied on edges (`input × weight`)
- Rectangular nodes displaying:
  - Weighted sum (Σ)
  - Bias addition
  - Activation function application
  - Final output

### 📋 Observation Table
**Right-click the Loss badge** to log the current configuration:
- Hidden layer architecture
- Activation function
- Loss function
- Optimizer
- Weight initialization
- Learning rate
- Current epoch, loss, and accuracy

Export to CSV for analysis!

### ⚙️ Extensive Configuration

| Category | Options |
|----------|---------|
| **Activations (13)** | Sigmoid, Tanh, ReLU, LeakyReLU, ELU, Swish, GELU, SELU, Mish, Softplus, Softsign, PReLU, CELU |
| **Loss Functions (6)** | MSE, MAE, Huber, Log-Cosh, Smooth L1, Quantile |
| **Optimizers (6)** | SGD, Momentum, RMSprop, Adam, AdaGrad, Nadam |
| **Weight Init (6)** | Xavier, He, LeCun, Uniform, Normal, Small Random |
| **Target Functions (100+)** | Trig, Polynomial, Gaussian, Waves, Peaks, and more |

### ✏️ Editable Values
Double-click any node or edge to edit its initial weight/bias value.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/neural-network-visualizer.git
   cd neural-network-visualizer
   ```

2. **Open in browser**
   Open `index.html` in any modern web browser.

3. **Start training**
   - Click **Play** to auto-train
   - Click **Step** to train one step at a time
   - Click **Reset** to reinitialize

## 📁 Project Structure

```
├── index.html            # Main HTML structure
├── styles.css            # All styling
├── nn-engine.js          # Neural network core (100+ target functions)
├── network-visualizer.js # Network graph canvas renderer
├── curve-visualizer.js   # Curve fitting visualization
├── charts.js             # Loss and accuracy charts
├── forward-pass-graph.js # Visual forward pass graph
├── observations.js       # Observation table functionality
└── app.js                # Application controller
```

## 🎮 Controls

| Control | Action |
|---------|--------|
| **▶ Play** | Start continuous training |
| **⏸ Pause** | Stop training |
| **⏭ Step** | Train N epochs (configurable) |
| **↺ Reset** | Reset network weights |
| **⛶ Fullscreen** | Fullscreen the curve panel |
| **Right-click Loss** | Log observation |
| **Double-click Node** | Edit initial bias |
| **Double-click Edge** | Edit initial weight |

## 🎯 Target Functions

100+ built-in target functions organized by category:
- **Trigonometric**: sine, cosine, sine2x, sine3x...
- **Polynomial**: linear, quadratic, cubic, quartic...
- **Gaussian**: gaussian, mexican_hat, double_gaussian...
- **Waves**: sawtooth, triangle, square_wave, beat...
- **Special**: step, sigmoid_like, sinc, gabor...
- **Peaks**: single_peak, double_peak, triple_peak...

## 💡 Tips

1. **Faster training**: Use Adam optimizer with learning rate 0.01-0.1
2. **Complex functions**: Add more hidden layers/neurons
3. **Smooth outputs**: Try Swish or GELU activations
4. **Robust to outliers**: Use Huber or Log-Cosh loss
5. **Compare configs**: Log multiple observations to the table

## 🛠️ Technologies

- **Pure JavaScript** - No external dependencies
- **Canvas API** - For all visualizations
- **CSS3** - Modern styling with glassmorphism

## 📄 License

MIT License - feel free to use, modify, and distribute.

---

Made with ❤️ for understanding neural networks
