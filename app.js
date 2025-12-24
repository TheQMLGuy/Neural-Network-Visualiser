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
        this.learningRate = 0.01;
        this.targetFunctionName = 'sine';

        // Training state
        this.isPlaying = false;
        this.animationId = null;
        this.stepSize = 5; // Epochs per step (from dropdown)

        // Initialize components
        this.initNetwork();
        this.initVisualizers();
        this.initControls();
        this.initTrainingData();

        // Initial render
        this.updateAllVisualizers();
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
        this.calcPanel = new CalculationsPanel();

        this.networkViz.setNetwork(this.network);
        this.curveViz.setNetwork(this.network);
        this.curveViz.setTargetFunction(this.targetFunctionName, TargetFunctions[this.targetFunctionName]);
        this.calcPanel.setNetwork(this.network);
    }

    initTrainingData() {
        const data = this.curveViz.getTrainingData();
        this.trainingInputs = data.inputs;
        this.trainingTargets = data.targets;
    }

    initControls() {
        // Layer controls
        this.layerInputsContainer = document.getElementById('layer-inputs');
        document.getElementById('add-layer-btn').addEventListener('click', () => this.addLayer());
        document.getElementById('remove-layer-btn').addEventListener('click', () => this.removeLayer());

        // Listen for layer size changes
        this.layerInputsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('layer-size')) {
                this.updateLayerSizes();
            }
        });

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

        // Update count display
        document.getElementById('fn-count').textContent = `(${fnNames.length})`;

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

    updateLayerSizes() {
        const inputs = this.layerInputsContainer.querySelectorAll('.layer-size');
        this.layerSizes = Array.from(inputs).map(input => parseInt(input.value) || 1);
        this.rebuildNetwork();
    }

    addLayer() {
        if (this.layerSizes.length >= 6) return; // Max 6 layers

        // Insert new hidden layer before output
        this.layerSizes.splice(this.layerSizes.length - 1, 0, 8);
        this.rebuildLayerInputs();
        this.rebuildNetwork();
    }

    removeLayer() {
        if (this.layerSizes.length <= 3) return; // Min: input, 1 hidden, output

        // Remove last hidden layer
        this.layerSizes.splice(this.layerSizes.length - 2, 1);
        this.rebuildLayerInputs();
        this.rebuildNetwork();
    }

    rebuildLayerInputs() {
        this.layerInputsContainer.innerHTML = '';

        this.layerSizes.forEach((size, index) => {
            if (index > 0) {
                const arrow = document.createElement('span');
                arrow.className = 'arrow';
                arrow.textContent = '→';
                this.layerInputsContainer.appendChild(arrow);
            }

            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'layer-size';
            input.value = size;
            input.min = 1;
            input.max = index === 0 || index === this.layerSizes.length - 1 ? 1 : 16;

            if (index === 0 || index === this.layerSizes.length - 1) {
                input.disabled = true;
                input.title = index === 0 ? 'Input layer (fixed)' : 'Output layer (fixed)';
            }

            this.layerInputsContainer.appendChild(input);
        });
    }

    rebuildNetwork() {
        this.stop();
        this.initNetwork();
        this.networkViz.setNetwork(this.network);
        this.curveViz.setNetwork(this.network);
        this.lossChart.clear();
        this.updateAllVisualizers();
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
        this.updateAllVisualizers();
    }

    updateAllVisualizers() {
        // Update epoch counter
        document.getElementById('epoch-counter').textContent = this.network.epoch;

        // Update loss display
        const currentLoss = this.network.lossHistory.length > 0
            ? this.network.lossHistory[this.network.lossHistory.length - 1]
            : 0;
        document.getElementById('current-loss').textContent = `Loss: ${currentLoss.toFixed(6)}`;

        // Update weight count
        const stats = this.network.getWeightStats();
        document.getElementById('weight-count').textContent = `${stats.count} weights`;

        // Update weight stats
        document.getElementById('min-weight').textContent = stats.min.toFixed(4);
        document.getElementById('max-weight').textContent = stats.max.toFixed(4);
        document.getElementById('avg-weight').textContent = stats.avg.toFixed(4);
        document.getElementById('avg-gradient').textContent = stats.gradientAvg.toFixed(6);

        // Render visualizations
        this.networkViz.render();
        this.curveViz.render();
        this.lossChart.update(this.network.lossHistory);
        this.calcPanel.update();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
