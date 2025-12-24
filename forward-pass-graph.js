/**
 * Visual Forward Pass Graph
 * Renders forward pass as a visual graph with calculations shown in rectangular nodes
 */

class ForwardPassGraph {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.network = null;
        this.inputValue = 0.5;

        // Colors
        this.colors = {
            bg: '#0a0a0f',
            node: '#1a1a2e',
            nodeStroke: '#6366f1',
            edge: 'rgba(99, 102, 241, 0.6)',
            text: '#ffffff',
            textMuted: '#888',
            weight: '#ffc832',
            bias: '#10b981',
            activation: '#ff6b6b',
            result: '#10b981'
        };

        // Node dimensions
        this.nodeWidth = 140;
        this.nodeHeight = 70;

        this.setupResize();
    }

    setupResize() {
        const resizeObserver = new ResizeObserver(() => this.resize());
        resizeObserver.observe(this.canvas.parentElement);
        this.resize();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = rect.height;

        this.render();
    }

    setNetwork(network) {
        this.network = network;
    }

    setInputValue(value) {
        this.inputValue = value;
        this.render();
    }

    update() {
        this.render();
    }

    render() {
        if (!this.network || !this.ctx) return;

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Calculate forward pass
        const forwardData = this.calculateForwardPass();

        // Layout
        const numLayers = this.network.layerSizes.length;
        const padding = 30;
        const layerSpacing = (this.width - padding * 2) / (numLayers);

        // Calculate node positions
        const positions = [];
        for (let l = 0; l < numLayers; l++) {
            const layerPositions = [];
            const numNodes = this.network.layerSizes[l];
            const layerHeight = numNodes * (this.nodeHeight + 15) - 15;
            const startY = (this.height - layerHeight) / 2;

            for (let n = 0; n < numNodes; n++) {
                layerPositions.push({
                    x: padding + l * layerSpacing + layerSpacing / 2,
                    y: startY + n * (this.nodeHeight + 15) + this.nodeHeight / 2
                });
            }
            positions.push(layerPositions);
        }

        // Draw connections with multiplication labels
        for (let l = 0; l < numLayers - 1; l++) {
            for (let fromNode = 0; fromNode < positions[l].length; fromNode++) {
                for (let toNode = 0; toNode < positions[l + 1].length; toNode++) {
                    const from = positions[l][fromNode];
                    const to = positions[l + 1][toNode];
                    const weight = this.network.weights[l][toNode][fromNode];
                    const inputVal = forwardData.layerOutputs[l][fromNode];

                    this.drawConnection(from, to, weight, inputVal);
                }
            }
        }

        // Draw nodes
        for (let l = 0; l < numLayers; l++) {
            for (let n = 0; n < positions[l].length; n++) {
                const pos = positions[l][n];

                if (l === 0) {
                    // Input node
                    this.drawInputNode(pos, forwardData.layerOutputs[0][n]);
                } else if (l === numLayers - 1) {
                    // Output node
                    this.drawOutputNode(pos, forwardData.layerOutputs[l][n]);
                } else {
                    // Hidden node with full calculation
                    const layerData = forwardData.layers[l - 1];
                    const neuronData = layerData ? layerData.neurons[n] : null;
                    this.drawHiddenNode(pos, neuronData, l, n);
                }
            }
        }
    }

    calculateForwardPass() {
        const nn = this.network;
        const x = this.inputValue;
        const activationFn = nn.activation.fn;
        const activationName = nn.activationName;

        const result = {
            input: x,
            activationName,
            layerOutputs: [[x]],
            layers: []
        };

        let currentInput = [x];

        for (let l = 0; l < nn.weights.length; l++) {
            const layerResult = { neurons: [] };
            const nextInput = [];

            for (let n = 0; n < nn.layerSizes[l + 1]; n++) {
                let weightedSum = 0;
                const terms = [];

                for (let i = 0; i < currentInput.length; i++) {
                    const w = nn.weights[l][n][i];
                    const inp = currentInput[i];
                    weightedSum += w * inp;
                    terms.push({ w, inp, product: w * inp });
                }

                const bias = nn.biases[l][n];
                const preActivation = weightedSum + bias;
                const output = l === nn.weights.length - 1 ? preActivation : activationFn(preActivation);

                nextInput.push(output);
                layerResult.neurons.push({
                    terms,
                    weightedSum,
                    bias,
                    preActivation,
                    output
                });
            }

            currentInput = nextInput;
            result.layerOutputs.push([...nextInput]);
            result.layers.push(layerResult);
        }

        return result;
    }

    drawConnection(from, to, weight, inputVal) {
        const ctx = this.ctx;
        const product = weight * inputVal;

        // Calculate edge start/end to not overlap nodes
        const startX = from.x + this.nodeWidth / 2 - 20;
        const endX = to.x - this.nodeWidth / 2 + 20;

        // Line
        ctx.beginPath();
        ctx.moveTo(startX, from.y);
        ctx.lineTo(endX, to.y);
        ctx.strokeStyle = this.colors.edge;
        ctx.lineWidth = Math.max(0.5, Math.min(3, Math.abs(weight)));
        ctx.stroke();

        // Multiplication label at midpoint
        const midX = (startX + endX) / 2;
        const midY = (from.y + to.y) / 2;

        // Background for label
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(midX - 35, midY - 10, 70, 20);

        // Label: "input × w = product"
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.colors.weight;
        ctx.fillText(`${inputVal.toFixed(2)}×${weight.toFixed(2)}`, midX, midY + 4);
    }

    drawInputNode(pos, value) {
        const ctx = this.ctx;
        const w = 60;
        const h = 40;

        // Rounded rect
        ctx.beginPath();
        ctx.roundRect(pos.x - w / 2, pos.y - h / 2, w, h, 8);
        ctx.fillStyle = this.colors.node;
        ctx.fill();
        ctx.strokeStyle = this.colors.nodeStroke;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.colors.textMuted;
        ctx.fillText('INPUT', pos.x, pos.y - 5);

        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = this.colors.text;
        ctx.fillText(value.toFixed(2), pos.x, pos.y + 12);
    }

    drawOutputNode(pos, value) {
        const ctx = this.ctx;
        const w = 80;
        const h = 50;

        // Rounded rect with green stroke
        ctx.beginPath();
        ctx.roundRect(pos.x - w / 2, pos.y - h / 2, w, h, 8);
        ctx.fillStyle = this.colors.node;
        ctx.fill();
        ctx.strokeStyle = this.colors.result;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.colors.textMuted;
        ctx.fillText('OUTPUT', pos.x, pos.y - 8);

        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = this.colors.result;
        ctx.fillText(value.toFixed(4), pos.x, pos.y + 12);
    }

    drawHiddenNode(pos, data, layerIndex, nodeIndex) {
        const ctx = this.ctx;
        const w = this.nodeWidth;
        const h = this.nodeHeight;

        if (!data) return;

        // Rounded rect
        ctx.beginPath();
        ctx.roundRect(pos.x - w / 2, pos.y - h / 2, w, h, 8);
        ctx.fillStyle = this.colors.node;
        ctx.fill();
        ctx.strokeStyle = this.colors.nodeStroke;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Line 1: Σ(w×x) = weightedSum
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.colors.textMuted;
        ctx.fillText(`Σ = ${data.weightedSum.toFixed(2)}`, pos.x, pos.y - 22);

        // Line 2: Σ + bias = preActivation
        const biasSign = data.bias >= 0 ? '+' : '';
        ctx.fillStyle = this.colors.text;
        ctx.fillText(`${data.weightedSum.toFixed(2)} ${biasSign} `, pos.x - 20, pos.y - 5);
        ctx.fillStyle = this.colors.bias;
        ctx.fillText(`${data.bias.toFixed(2)}`, pos.x + 15, pos.y - 5);
        ctx.fillStyle = this.colors.text;
        ctx.fillText(` = ${data.preActivation.toFixed(2)}`, pos.x + 40, pos.y - 5);

        // Line 3: σ(preAct) = output
        ctx.fillStyle = this.colors.activation;
        ctx.fillText(`σ(${data.preActivation.toFixed(2)})`, pos.x - 15, pos.y + 12);
        ctx.fillStyle = this.colors.text;
        ctx.fillText('=', pos.x + 20, pos.y + 12);
        ctx.fillStyle = this.colors.result;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`${data.output.toFixed(3)}`, pos.x + 45, pos.y + 12);

        // Node label
        ctx.font = '8px Inter, sans-serif';
        ctx.fillStyle = this.colors.textMuted;
        ctx.fillText(`H${layerIndex}[${nodeIndex}]`, pos.x, pos.y + 28);
    }
}

// Export
window.ForwardPassGraph = ForwardPassGraph;
