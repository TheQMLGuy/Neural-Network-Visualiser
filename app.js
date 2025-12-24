/**
 * Neural Network Visualizer - Main Application
 * Controls training loop and coordinates all visualizers
 */

class App {
    constructor() {
        // Network configuration
        this.layerSizes = [1, 8, 8, 1];
        this.activationName = 'sigmoid';
        this.optimizerName = 'adam';
        this.lossFunctionName = 'mse';
        this.weightInitName = 'xavier';
        this.learningRate = 0.01;
        this.targetFunctionName = 'sine';

        // Training state
        this.isPlaying = false;
        this.animationId = null;
        this.stepSize = 5;
        this.accuracyHistory = [];

        // Initialize components
        this.initNetwork();
        this.initVisualizers();
        this.initControls();
        this.initTrainingData();

        // Initial render with delay to ensure layout needs are met
        this.updateAllVisualizers();

        // Force rebuild after short delay to fix node control positioning
        setTimeout(() => {
            this.networkViz.resize();
            this.rebuildNetwork();
        }, 100);

        // Listen for resize events to update node controls
        window.addEventListener('resize', () => {
            if (this.networkViz) {
                // Wait for layout to settle
                setTimeout(() => this.renderNodeControls(), 50);
            }
        });
    }

    initNetwork() {
        this.network = new NeuralNetwork(
            this.layerSizes,
            this.activationName,
            this.optimizerName,
            this.learningRate
        );
    }

    initVisualizers() {
        this.networkViz = new NetworkVisualizer('network-canvas', 'tooltip');
        this.curveViz = new CurveVisualizer('curve-canvas');
        this.lossChart = new LossChart('loss-canvas');
        this.accuracyChart = new AccuracyChart('accuracy-canvas');
        this.forwardPassGraph = new ForwardPassGraph('forward-pass-canvas');
        this.observationsPanel = new ObservationsPanel();

        this.networkViz.setNetwork(this.network);
        this.curveViz.setNetwork(this.network);
        this.curveViz.setTargetFunction(this.targetFunctionName, TargetFunctions[this.targetFunctionName]);
        this.forwardPassGraph.setNetwork(this.network);
    }

    initTrainingData() {
        const data = this.curveViz.getTrainingData();
        this.trainingInputs = data.inputs;
        this.trainingTargets = data.targets;
    }

    initControls() {
        // Visual layer controls (overlay on network canvas)
        const addLayerVisual = document.getElementById('add-layer-visual');
        const removeLayerVisual = document.getElementById('remove-layer-visual');
        if (addLayerVisual) {
            addLayerVisual.addEventListener('click', () => this.addLayer());
        }
        if (removeLayerVisual) {
            removeLayerVisual.addEventListener('click', () => this.removeLayer());
        }

        // Activation select
        document.getElementById('activation-select').addEventListener('change', (e) => {
            this.activationName = e.target.value;
            this.network.setActivation(this.activationName);
            this.updateAllVisualizers();
        });

        // Optimizer select
        document.getElementById('optimizer-select').addEventListener('change', (e) => {
            this.optimizerName = e.target.value;
            this.network.setOptimizer(this.optimizerName, this.learningRate);
        });

        // Learning rate
        document.getElementById('learning-rate').addEventListener('change', (e) => {
            this.learningRate = parseFloat(e.target.value) || 0.01;
            this.network.setOptimizer(this.optimizerName, this.learningRate);
        });

        // Loss function select
        document.getElementById('loss-select').addEventListener('change', (e) => {
            this.lossFunctionName = e.target.value;
            // Loss function is used in training loop
        });

        // Weight init select
        document.getElementById('init-select').addEventListener('change', (e) => {
            this.weightInitName = e.target.value;
            // Applied on next reset
        });

        // Populate target function dropdown
        this.populateFunctionDropdown();

        // Target function select
        const targetSelect = document.getElementById('target-function');
        targetSelect.addEventListener('change', (e) => {
            this.targetFunctionName = e.target.value;
            this.curveViz.setTargetFunction(this.targetFunctionName, TargetFunctions[this.targetFunctionName]);
            this.initTrainingData();
            this.reset();
        });

        // Function search
        const searchInput = document.getElementById('target-search');
        searchInput.addEventListener('input', (e) => {
            this.filterFunctions(e.target.value);
        });
        searchInput.addEventListener('focus', () => {
            targetSelect.size = 8; // Expand dropdown
        });
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                targetSelect.size = 1; // Collapse
            }, 200);
        });

        // Step size
        document.getElementById('step-size').addEventListener('change', (e) => {
            this.stepSize = parseInt(e.target.value) || 5;
        });

        // Fullscreen toggle
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // ESC key to exit fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const panel = document.getElementById('curve-panel');
                if (panel.classList.contains('fullscreen')) {
                    panel.classList.remove('fullscreen');
                    this.curveViz.resize();
                }
            }
        });

        // Training controls
        this.playBtn = document.getElementById('play-btn');
        this.playBtn.addEventListener('click', () => this.togglePlay());

        document.getElementById('step-btn').addEventListener('click', () => this.step());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
    }

    populateFunctionDropdown() {
        const select = document.getElementById('target-function');
        const fnNames = Object.keys(TargetFunctions);

        // Update count display if exists
        const countEl = document.getElementById('fn-count');
        if (countEl) {
            countEl.textContent = `(${fnNames.length})`;
        }

        select.innerHTML = '';
        fnNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name.replace(/_/g, ' ');
            if (name === this.targetFunctionName) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    filterFunctions(query) {
        const select = document.getElementById('target-function');
        const options = select.querySelectorAll('option');
        const lowerQuery = query.toLowerCase();

        options.forEach(opt => {
            const matches = opt.textContent.toLowerCase().includes(lowerQuery) ||
                opt.value.toLowerCase().includes(lowerQuery);
            opt.style.display = matches ? '' : 'none';
        });

        // Show dropdown
        select.size = 8;
    }

    toggleFullscreen() {
        const panel = document.getElementById('curve-panel');
        panel.classList.toggle('fullscreen');

        // Trigger resize after toggling
        setTimeout(() => {
            this.curveViz.resize();
        }, 50);
    }

    addLayer() {
        if (this.layerSizes.length >= 6) return; // Max 6 layers

        // Insert new hidden layer before output
        this.layerSizes.splice(this.layerSizes.length - 1, 0, 8);
        this.rebuildNetwork();
    }

    removeLayer() {
        if (this.layerSizes.length <= 3) return; // Min: input, 1 hidden, output

        // Remove last hidden layer
        this.layerSizes.splice(this.layerSizes.length - 2, 1);
        this.rebuildNetwork();
    }

    addNode(layerIndex) {
        // Only modify hidden layers (index 1 to length-2)
        if (layerIndex <= 0 || layerIndex >= this.layerSizes.length - 1) return;
        if (this.layerSizes[layerIndex] >= 16) return; // Max 16 nodes

        this.layerSizes[layerIndex]++;
        this.rebuildNetwork();
    }

    removeNode(layerIndex) {
        // Only modify hidden layers
        if (layerIndex <= 0 || layerIndex >= this.layerSizes.length - 1) return;
        if (this.layerSizes[layerIndex] <= 1) return; // Min 1 node

        this.layerSizes[layerIndex]--;
        this.rebuildNetwork();
    }

    renderNodeControls() {
        const container = document.getElementById('node-controls-container');
        if (!container) return;

        container.innerHTML = '';

        // Wait for next frame to ensure visualizer has updated dimensions
        requestAnimationFrame(() => {
            if (!this.networkViz || !this.networkViz.width) return;

            const padding = 80;
            const width = this.networkViz.width;
            const height = this.networkViz.height;
            const layerCount = this.layerSizes.length;

            // Loop through hidden layers only
            for (let l = 1; l < layerCount - 1; l++) {
                // Calculate X position matching network-visualizer logic
                const x = padding + (l / (layerCount - 1)) * (width - padding * 2);

                const controls = document.createElement('div');
                controls.className = 'node-control';
                controls.style.left = `${x}px`;
                controls.style.bottom = '10px';
                controls.style.transform = 'translateX(-50%)';

                const addBtn = document.createElement('button');
                addBtn.className = 'node-btn ctrl-add-node';
                addBtn.textContent = '+';
                addBtn.title = 'Add node';
                addBtn.onclick = () => this.addNode(l);

                const removeBtn = document.createElement('button');
                removeBtn.className = 'node-btn ctrl-remove-node';
                removeBtn.textContent = '-';
                removeBtn.title = 'Remove node';
                removeBtn.onclick = () => this.removeNode(l);

                controls.appendChild(removeBtn);
                controls.appendChild(addBtn);
                container.appendChild(controls);
            }
        });
    }

    rebuildNetwork() {
        this.stop();
        this.initNetwork();
        this.networkViz.setNetwork(this.network);
        this.curveViz.setNetwork(this.network);
        this.forwardPassGraph.setNetwork(this.network);
        this.lossChart.clear();
        this.accuracyChart.clear();
        this.accuracyHistory = [];
        this.updateAllVisualizers();
        this.renderNodeControls();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    }

    play() {
        this.isPlaying = true;
        this.playBtn.innerHTML = '<span class="icon">⏸</span> Pause';
        this.playBtn.classList.add('playing');
        this.trainingLoop();
    }

    stop() {
        this.isPlaying = false;
        this.playBtn.innerHTML = '<span class="icon">▶</span> Play';
        this.playBtn.classList.remove('playing');
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    trainingLoop() {
        if (!this.isPlaying) return;

        // Train stepSize epochs per frame
        for (let i = 0; i < this.stepSize; i++) {
            this.trainEpoch();
        }

        this.updateAllVisualizers();

        this.animationId = requestAnimationFrame(() => this.trainingLoop());
    }

    step() {
        // Train stepSize epochs on each step click
        for (let i = 0; i < this.stepSize; i++) {
            this.trainEpoch();
        }
        this.updateAllVisualizers();
    }

    trainEpoch() {
        this.network.train(this.trainingInputs, this.trainingTargets);
    }

    reset() {
        this.stop();
        this.network.reset();
        this.lossChart.clear();
        this.accuracyChart.clear();
        this.accuracyHistory = [];
        this.forwardPassGraph.setNetwork(this.network);
        this.updateAllVisualizers();
    }

    calculateAccuracy() {
        if (!this.trainingInputs || !this.trainingTargets) return 0;

        let totalError = 0;
        const targetMin = Math.min(...this.trainingTargets);
        const targetMax = Math.max(...this.trainingTargets);
        const maxRange = Math.max(1, targetMax - targetMin);

        for (let i = 0; i < this.trainingInputs.length; i++) {
            const prediction = this.network.predict(this.trainingInputs[i]);
            const target = this.trainingTargets[i];
            totalError += Math.abs(prediction - target);
        }

        const avgError = totalError / this.trainingInputs.length;
        return Math.max(0, (1 - avgError / maxRange) * 100);
    }

    updateAllVisualizers() {
        // Update epoch counter
        document.getElementById('epoch-counter').textContent = this.network.epoch;

        // Update loss display
        const currentLoss = this.network.lossHistory.length > 0
            ? this.network.lossHistory[this.network.lossHistory.length - 1]
            : 0;
        document.getElementById('current-loss').textContent = `Loss: ${currentLoss.toFixed(6)}`;

        // Calculate and track accuracy
        const accuracy = this.calculateAccuracy();
        if (this.network.epoch > 0) {
            this.accuracyHistory.push(accuracy);
        }
        document.getElementById('current-accuracy').textContent = `${accuracy.toFixed(2)}%`;

        // Update weight count
        const stats = this.network.getWeightStats();
        document.getElementById('weight-count').textContent = `${stats.count} weights`;

        // Render visualizations
        this.networkViz.render();
        this.curveViz.render();
        this.lossChart.update(this.network.lossHistory);
        this.accuracyChart.update(this.accuracyHistory);
        this.forwardPassGraph.update();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
