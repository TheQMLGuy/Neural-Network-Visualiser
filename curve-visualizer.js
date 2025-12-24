/**
 * Curve Visualizer
 * Shows activation decomposition: single activation shape (red), 
 * weighted activations (yellow), and resultant curve (green)
 */

class CurveVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.network = null;
        this.targetFunction = null;
        this.targetName = 'sine';

        // Data points for plotting
        this.plotPoints = [];
        this.generatePlotPoints();

        // Colors
        this.colors = {
            grid: 'rgba(255, 255, 255, 0.05)',
            axis: 'rgba(255, 255, 255, 0.2)',
            target: 'rgba(255, 255, 255, 0.4)',
            // Single red for activation function shape
            activation: '#ff6464',
            // Yellow shades for weighted activations
            weighted: [
                'rgba(255, 200, 50, 0.6)',
                'rgba(255, 180, 30, 0.6)',
                'rgba(255, 220, 70, 0.6)',
                'rgba(255, 160, 40, 0.6)',
                'rgba(255, 240, 90, 0.6)',
                'rgba(255, 190, 20, 0.6)',
                'rgba(255, 210, 60, 0.6)',
                'rgba(255, 170, 50, 0.6)',
                'rgba(255, 230, 80, 0.6)',
                'rgba(255, 200, 40, 0.6)',
                'rgba(255, 185, 55, 0.6)',
                'rgba(255, 215, 65, 0.6)',
                'rgba(255, 175, 35, 0.6)',
                'rgba(255, 225, 75, 0.6)',
                'rgba(255, 195, 45, 0.6)',
                'rgba(255, 205, 55, 0.6)',
            ],
            result: '#10b981',
            text: '#606070'
        };

        // Setup resize observer
        this.setupResize();
    }

    setupResize() {
        const resizeObserver = new ResizeObserver(() => {
            this.resize();
        });
        resizeObserver.observe(this.canvas.parentElement);
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Ensure minimum dimensions
        const width = Math.max(rect.width, 200);
        const height = Math.max(rect.height, 150);

        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;

        this.ctx.scale(dpr, dpr);

        this.width = width;
        this.height = height;

        this.render();
    }

    setNetwork(network) {
        this.network = network;
    }

    setTargetFunction(name, fn) {
        this.targetName = name;
        this.targetFunction = fn;
        this.render();
    }

    generatePlotPoints(count = 100) {
        this.plotPoints = [];
        for (let i = 0; i < count; i++) {
            const x = -1 + (i / (count - 1)) * 2; // Range [-1, 1]
            this.plotPoints.push(x);
        }
    }

    // Convert data coordinates to canvas coordinates
    toCanvas(x, y) {
        const padding = 40;
        const plotWidth = this.width - padding * 2;
        const plotHeight = this.height - padding * 2;

        // Map x from [-1, 1] to canvas
        const canvasX = padding + ((x + 1) / 2) * plotWidth;

        // Map y from [-1.5, 1.5] to canvas (inverted)
        const canvasY = padding + ((1.5 - y) / 3) * plotHeight;

        return { x: canvasX, y: canvasY };
    }

    render() {
        if (!this.ctx || this.width <= 0 || this.height <= 0) return;

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        this.drawGrid();
        this.drawAxes();

        if (this.targetFunction) {
            this.drawTargetCurve();
        }

        if (this.network && this.network.layerSizes.length > 2) {
            this.drawActivationDecomposition();
        }
    }

    drawGrid() {
        const ctx = this.ctx;
        const padding = 40;

        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 1;

        // Vertical grid lines
        for (let x = -1; x <= 1; x += 0.25) {
            const pos = this.toCanvas(x, 0);
            ctx.beginPath();
            ctx.moveTo(pos.x, padding);
            ctx.lineTo(pos.x, this.height - padding);
            ctx.stroke();
        }

        // Horizontal grid lines
        for (let y = -1.5; y <= 1.5; y += 0.5) {
            const pos = this.toCanvas(0, y);
            ctx.beginPath();
            ctx.moveTo(padding, pos.y);
            ctx.lineTo(this.width - padding, pos.y);
            ctx.stroke();
        }
    }

    drawAxes() {
        const ctx = this.ctx;
        const padding = 40;

        ctx.strokeStyle = this.colors.axis;
        ctx.lineWidth = 1;

        // X-axis
        const origin = this.toCanvas(0, 0);
        ctx.beginPath();
        ctx.moveTo(padding, origin.y);
        ctx.lineTo(this.width - padding, origin.y);
        ctx.stroke();

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(origin.x, padding);
        ctx.lineTo(origin.x, this.height - padding);
        ctx.stroke();

        // Labels
        ctx.fillStyle = this.colors.text;
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';

        // X-axis labels
        for (let x = -1; x <= 1; x += 0.5) {
            const pos = this.toCanvas(x, 0);
            ctx.fillText(x.toFixed(1), pos.x, this.height - padding + 15);
        }

        // Y-axis labels
        ctx.textAlign = 'right';
        for (let y = -1; y <= 1; y += 0.5) {
            const pos = this.toCanvas(0, y);
            ctx.fillText(y.toFixed(1), padding - 8, pos.y + 4);
        }
    }

    drawTargetCurve() {
        const ctx = this.ctx;

        ctx.strokeStyle = this.colors.target;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);

        ctx.beginPath();

        for (let i = 0; i < this.plotPoints.length; i++) {
            const x = this.plotPoints[i];
            const y = this.targetFunction(x);
            const pos = this.toCanvas(x, y);

            if (i === 0) {
                ctx.moveTo(pos.x, pos.y);
            } else {
                ctx.lineTo(pos.x, pos.y);
            }
        }

        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawActivationDecomposition() {
        const ctx = this.ctx;
        const nn = this.network;

        // Get the last hidden layer index
        const lastHiddenLayerIdx = nn.layerSizes.length - 2;
        const numHiddenNeurons = nn.layerSizes[lastHiddenLayerIdx];
        const outputWeights = nn.weights[nn.weights.length - 1][0]; // Weights to output neuron
        const outputBias = nn.biases[nn.biases.length - 1][0];

        // For each plot point, calculate individual neuron contributions
        const weightedCurves = [];   // Weighted contributions
        const resultCurve = [];      // Final combined output

        for (let i = 0; i < numHiddenNeurons; i++) {
            weightedCurves.push([]);
        }

        // Generate curves for each x position
        for (let pIdx = 0; pIdx < this.plotPoints.length; pIdx++) {
            const x = this.plotPoints[pIdx];

            // Do forward pass and store intermediate values
            nn.forward(x);

            // Get activations from last hidden layer
            const hiddenActivations = nn.layerOutputs[lastHiddenLayerIdx];

            let sum = outputBias;
            for (let n = 0; n < numHiddenNeurons; n++) {
                const act = hiddenActivations[n];
                const weighted = act * outputWeights[n];

                weightedCurves[n].push({ x, y: weighted });

                sum += weighted;
            }

            resultCurve.push({ x, y: sum });
        }

        // Draw SINGLE activation function shape (RED)
        // This shows the raw activation function shape, not per-neuron
        this.drawActivationFunctionShape();

        // Draw weighted curves (YELLOW) - one per neuron
        for (let n = 0; n < numHiddenNeurons; n++) {
            this.drawCurve(weightedCurves[n], this.colors.weighted[n % this.colors.weighted.length], 2, false);
        }

        // Draw result curve (GREEN) with glow
        ctx.shadowColor = this.colors.result;
        ctx.shadowBlur = 15;
        this.drawCurve(resultCurve, this.colors.result, 4, true);
        ctx.shadowBlur = 0;
    }

    // Draw the activation function shape (single red line)
    drawActivationFunctionShape() {
        const ctx = this.ctx;
        const nn = this.network;

        if (!nn || !nn.activation) return;

        const activationFn = nn.activation.fn;
        const points = [];

        // Draw activation over range [-3, 3] mapped to [-1, 1] display
        for (let i = 0; i < 100; i++) {
            const t = -3 + (i / 99) * 6; // Input range for activation
            const y = activationFn(t);
            const x = t / 3; // Map to [-1, 1] for display
            points.push({ x, y });
        }

        ctx.strokeStyle = this.colors.activation;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;

        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
            const pos = this.toCanvas(points[i].x, points[i].y);
            if (i === 0) {
                ctx.moveTo(pos.x, pos.y);
            } else {
                ctx.lineTo(pos.x, pos.y);
            }
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    drawCurve(points, color, lineWidth, glow) {
        if (points.length < 2) return;

        const ctx = this.ctx;

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();

        for (let i = 0; i < points.length; i++) {
            const pos = this.toCanvas(points[i].x, Math.max(-1.5, Math.min(1.5, points[i].y)));

            if (i === 0) {
                ctx.moveTo(pos.x, pos.y);
            } else {
                ctx.lineTo(pos.x, pos.y);
            }
        }

        ctx.stroke();
    }

    // Get training data
    getTrainingData() {
        if (!this.targetFunction) return { inputs: [], targets: [] };

        const trainingPoints = [];
        for (let i = 0; i < 30; i++) {
            const x = -1 + (i / 29) * 2;
            trainingPoints.push(x);
        }

        return {
            inputs: trainingPoints,
            targets: trainingPoints.map(x => this.targetFunction(x))
        };
    }
}

// Export
window.CurveVisualizer = CurveVisualizer;
