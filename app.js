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
        this.targetFunctionName = 'sine'; // Legacy - for first output

        // Multi-output function configuration
        // Each output node has its own target function
        this.outputFunctions = ['sine'];

        // Training state
        this.isPlaying = false;
        this.animationId = null;
        this.epochsToTrain = 1000;
        this.currentEpoch = 0;
        this.trainAccuracyHistory = [];
        this.testAccuracyHistory = [];

        // Noise configuration
        this.noiseLevel = 0.1; // 10% default

        // Training data (noisy for train, pure for test)
        this.trainInputs = [];
        this.trainTargets = []; // noisy
        this.testInputs = [];
        this.testTargets = []; // pure (no noise)

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
            this.initMetricsUI();
            this.renderExperimentsPanel();
        }, 100);

        // Listen for resize events to update node controls
        window.addEventListener('resize', () => {
            if (this.networkViz) {
                // Wait for layout to settle
                setTimeout(() => {
                    this.renderNodeControls();
                    this.renderOutputControls();
                }, 50);
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
        this.accuracyChart = new AccuracyChart('accuracy-canvas');
        this.forwardPassGraph = new ForwardPassGraph('forward-pass-canvas');
        this.observationsPanel = new ObservationsPanel();

        this.networkViz.setNetwork(this.network);
        this.curveViz.setNetwork(this.network);
        this.updateCurveVizTargets();
        this.forwardPassGraph.setNetwork(this.network);
    }

    // Update curve visualizer with current output functions
    updateCurveVizTargets() {
        const targets = this.outputFunctions.map(name => ({
            name,
            fn: TargetFunctions[name]
        }));
        this.curveViz.setTargetFunctions(targets);
    }

    initTrainingData() {
        const data = this.curveViz.getTrainingData();
        const allInputs = data.inputs;
        const pureTargets = data.targets;

        // Generate noisy training data and pure test data
        // Both use the same x values, but train has noise added to y
        this.trainInputs = [...allInputs];
        this.testInputs = [...allInputs];
        this.testTargets = [...pureTargets]; // Pure function values

        // Add noise to training targets
        this.trainTargets = pureTargets.map(target => {
            if (Array.isArray(target)) {
                // Multi-output: add noise to each output
                return target.map(t => this.addNoise(t));
            } else {
                return this.addNoise(target);
            }
        });

        // Legacy compatibility
        this.trainingInputs = this.trainInputs;
        this.trainingTargets = this.trainTargets;
    }

    // Add Gaussian noise to a value
    addNoise(value) {
        // Box-Muller transform for Gaussian noise
        const u1 = Math.random();
        const u2 = Math.random();
        const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return value + gaussian * this.noiseLevel;
    }

    // Regenerate training data with current noise level
    regenerateNoisyData() {
        this.initTrainingData();
        this.curveViz.setNoisyData(this.trainInputs, this.trainTargets);
    }

    // Add output node with default function
    addOutputNode() {
        const outputCount = this.layerSizes[this.layerSizes.length - 1];
        if (outputCount >= 8) return; // Max 8 outputs

        this.layerSizes[this.layerSizes.length - 1]++;
        // Add default function for new output
        this.outputFunctions.push('cosine');
        this.rebuildNetwork();
    }

    // Remove last output node
    removeOutputNode() {
        const outputCount = this.layerSizes[this.layerSizes.length - 1];
        if (outputCount <= 1) return; // Min 1 output

        this.layerSizes[this.layerSizes.length - 1]--;
        this.outputFunctions.pop();
        this.rebuildNetwork();
    }

    // Set function for specific output
    setOutputFunction(outputIndex, functionName) {
        if (outputIndex >= 0 && outputIndex < this.outputFunctions.length) {
            this.outputFunctions[outputIndex] = functionName;
            // Keep legacy property in sync with first output
            if (outputIndex === 0) {
                this.targetFunctionName = functionName;
            }
            this.updateCurveVizTargets();
            this.initTrainingData();
            this.reset();
        }
    }

    // Render output layer controls (add/remove buttons and function dropdowns)
    renderOutputControls() {
        const container = document.getElementById('output-controls-container');
        if (!container) return;

        container.innerHTML = '';

        requestAnimationFrame(() => {
            if (!this.networkViz || !this.networkViz.width) return;

            const padding = 80;
            const width = this.networkViz.width;
            const layerCount = this.layerSizes.length;
            const outputCount = this.layerSizes[layerCount - 1];

            // Position for output layer (rightmost)
            const x = padding + ((layerCount - 1) / (layerCount - 1)) * (width - padding * 2);

            // Add/Remove buttons for output layer
            const controls = document.createElement('div');
            controls.className = 'output-control';
            controls.style.left = `${x}px`;
            controls.style.bottom = '10px';
            controls.style.transform = 'translateX(-50%)';

            const addBtn = document.createElement('button');
            addBtn.className = 'node-btn ctrl-add-node';
            addBtn.textContent = '+';
            addBtn.title = 'Add output node';
            addBtn.onclick = () => this.addOutputNode();

            const removeBtn = document.createElement('button');
            removeBtn.className = 'node-btn ctrl-remove-node';
            removeBtn.textContent = '-';
            removeBtn.title = 'Remove output node';
            removeBtn.onclick = () => this.removeOutputNode();

            controls.appendChild(removeBtn);
            controls.appendChild(addBtn);
            container.appendChild(controls);

            // Function dropdowns for each output node
            const fnNames = Object.keys(TargetFunctions);
            for (let i = 0; i < outputCount; i++) {
                const nodeY = padding + ((i + 0.5) / outputCount) * (this.networkViz.height - padding * 2);

                const dropdown = document.createElement('select');
                dropdown.className = 'output-fn-select';
                dropdown.style.position = 'absolute';
                dropdown.style.left = `${x + 25}px`;
                dropdown.style.top = `${nodeY}px`;
                dropdown.style.transform = 'translateY(-50%)';
                dropdown.title = `Output ${i + 1} target function`;

                fnNames.forEach(name => {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name.replace(/_/g, ' ');
                    if (name === this.outputFunctions[i]) {
                        option.selected = true;
                    }
                    dropdown.appendChild(option);
                });

                dropdown.addEventListener('change', (e) => {
                    this.setOutputFunction(i, e.target.value);
                });

                container.appendChild(dropdown);
            }
        });
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

        // Epochs count
        const epochsInput = document.getElementById('epochs-count');
        if (epochsInput) {
            epochsInput.addEventListener('change', (e) => {
                this.epochsToTrain = parseInt(e.target.value) || 1000;
            });
        }

        // Noise slider
        const noiseSlider = document.getElementById('noise-slider');
        const noiseValue = document.getElementById('noise-value');
        if (noiseSlider) {
            noiseSlider.addEventListener('input', (e) => {
                const percent = parseInt(e.target.value);
                this.noiseLevel = percent / 100;
                if (noiseValue) noiseValue.textContent = percent + '%';
                this.regenerateNoisyData();
            });
        }

        // Fullscreen toggles
        const fsCurve = document.getElementById('btn-fullscreen-curve');
        if (fsCurve) {
            fsCurve.addEventListener('click', () => this.toggleFullscreen('curve-panel'));
        }

        const fsNetwork = document.getElementById('btn-fullscreen-network');
        if (fsNetwork) {
            fsNetwork.addEventListener('click', () => this.toggleFullscreen('network-panel'));
        }

        const fsForward = document.getElementById('btn-fullscreen-forward');
        if (fsForward) {
            fsForward.addEventListener('click', () => this.toggleFullscreen('forward-pass-panel'));
        }

        const fsObs = document.getElementById('btn-fullscreen-obs');
        if (fsObs) {
            fsObs.addEventListener('click', () => this.toggleModalFullscreen('observations-modal'));
        }

        // ESC key to exit fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Check for any fullscreen panel
                const fullscreenPanel = document.querySelector('.panel.fullscreen');
                if (fullscreenPanel) {
                    this.toggleFullscreen(fullscreenPanel.id);
                    return;
                }

                // Check for fullscreen modal content
                const fullscreenModalContent = document.querySelector('.modal-content.fullscreen');
                if (fullscreenModalContent) {
                    const modal = fullscreenModalContent.closest('.modal');
                    if (modal) {
                        this.toggleModalFullscreen(modal.id);
                        return;
                    }
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

    toggleFullscreen(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        panel.classList.toggle('fullscreen');

        // Trigger resize for all potential visualizers
        setTimeout(() => {
            if (this.curveViz) this.curveViz.resize();
            if (this.networkViz) this.networkViz.resize();
            if (this.forwardPassGraph) this.forwardPassGraph.resize();

            // Re-render controls if network panel is resized
            if (panelId === 'network-panel') {
                this.renderNodeControls();
            }
        }, 50);
    }

    toggleModalFullscreen(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const content = modal.querySelector('.modal-content');
        if (content) {
            content.classList.toggle('fullscreen');
        }
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
        this.updateCurveVizTargets();
        this.forwardPassGraph.setNetwork(this.network);
        this.lossChart.clear();
        this.accuracyChart.clear();
        this.accuracyHistory = [];
        this.initTrainingData();
        this.updateAllVisualizers();
        this.renderNodeControls();
        this.renderOutputControls();
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
        for (let i = 0; i < this.epochsToTrain; i++) {
            this.trainEpoch();
        }
        this.updateAllVisualizers();
    }

    trainEpoch() {
        // Train on noisy data
        this.network.train(this.trainInputs, this.trainTargets);
    }

    reset() {
        this.stop();
        this.currentEpoch = 0;
        this.network.reset();
        this.accuracyChart.clear();
        this.trainAccuracyHistory = [];
        this.testAccuracyHistory = [];
        this.regenerateNoisyData();
        this.forwardPassGraph.setNetwork(this.network);
        this.updateAllVisualizers();
    }

    // Calculate accuracy on given dataset
    calculateAccuracyOnData(inputs, targets) {
        if (!inputs || inputs.length === 0) return 0;

        let totalError = 0;
        let totalCount = 0;

        // Get range for normalization
        let allTargetValues = [];
        for (const target of targets) {
            if (Array.isArray(target)) {
                allTargetValues.push(...target);
            } else {
                allTargetValues.push(target);
            }
        }
        const targetMin = Math.min(...allTargetValues);
        const targetMax = Math.max(...allTargetValues);
        const maxRange = Math.max(1, targetMax - targetMin);

        for (let i = 0; i < inputs.length; i++) {
            const predictions = this.network.predict(inputs[i]);
            const target = targets[i];

            if (Array.isArray(target)) {
                for (let j = 0; j < target.length; j++) {
                    totalError += Math.abs(predictions[j] - target[j]);
                    totalCount++;
                }
            } else {
                totalError += Math.abs(predictions[0] - target);
                totalCount++;
            }
        }

        const avgError = totalError / totalCount;
        return Math.max(0, (1 - avgError / maxRange) * 100);
    }

    // Calculate train accuracy (on noisy data)
    calculateTrainAccuracy() {
        return this.calculateAccuracyOnData(this.trainInputs, this.trainTargets);
    }

    // Calculate test accuracy (on pure function)
    calculateTestAccuracy() {
        return this.calculateAccuracyOnData(this.testInputs, this.testTargets);
    }

    updateAllVisualizers() {
        // Update epoch counter
        document.getElementById('epoch-counter').textContent = this.network.epoch;

        // Calculate and display train/test accuracy
        const trainAcc = this.calculateTrainAccuracy();
        const testAcc = this.calculateTestAccuracy();

        // Update history
        if (this.network.epoch > 0) {
            this.trainAccuracyHistory.push(trainAcc);
            this.testAccuracyHistory.push(testAcc);
        }

        // Update accuracy displays
        const trainAccEl = document.getElementById('train-accuracy');
        const testAccEl = document.getElementById('test-accuracy');
        if (trainAccEl) trainAccEl.textContent = `${trainAcc.toFixed(2)}%`;
        if (testAccEl) testAccEl.textContent = `${testAcc.toFixed(2)}%`;

        // Update header accuracy (show test accuracy as main metric)
        document.getElementById('current-accuracy').textContent = `${testAcc.toFixed(2)}%`;

        // Update weight count
        const stats = this.network.getWeightStats();
        document.getElementById('weight-count').textContent = `${stats.count} weights`;

        // Render visualizations
        this.networkViz.render();
        this.curveViz.render();
        this.accuracyChart.update(this.trainAccuracyHistory, this.testAccuracyHistory);
        this.forwardPassGraph.update();
    }

    // Evaluate metrics on a dataset
    evaluateMetrics(inputs, targets) {
        if (!inputs || inputs.length === 0) return null;

        const predictions = inputs.map(x => this.network.predict(x));
        return MetricsEngine.calculateAllMetrics(predictions, targets, 0.1);
    }

    // Update all metrics (train, val, test)
    updateMetrics() {
        if (typeof MetricsEngine === 'undefined') return;

        // Calculate metrics for each split
        this.trainMetrics = this.evaluateMetrics(this.trainInputs, this.trainTargets);
        this.valMetrics = this.evaluateMetrics(this.valInputs, this.valTargets);
        this.testMetrics = this.evaluateMetrics(this.testInputs, this.testTargets);

        // Update metrics display if elements exist
        this.updateMetricsDisplay();
    }

    // Update metrics UI display
    updateMetricsDisplay() {
        const updateElement = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        if (this.trainMetrics) {
            updateElement('train-precision', (this.trainMetrics.precision * 100).toFixed(1) + '%');
            updateElement('train-recall', (this.trainMetrics.recall * 100).toFixed(1) + '%');
            updateElement('train-f1', (this.trainMetrics.f1 * 100).toFixed(1) + '%');
            updateElement('train-r2', this.trainMetrics.r2.toFixed(4));
            updateElement('train-mse', this.trainMetrics.mse.toFixed(6));
        }

        if (this.valMetrics) {
            updateElement('val-precision', (this.valMetrics.precision * 100).toFixed(1) + '%');
            updateElement('val-recall', (this.valMetrics.recall * 100).toFixed(1) + '%');
            updateElement('val-f1', (this.valMetrics.f1 * 100).toFixed(1) + '%');
            updateElement('val-r2', this.valMetrics.r2.toFixed(4));
            updateElement('val-mse', this.valMetrics.mse.toFixed(6));
        }

        if (this.testMetrics) {
            updateElement('test-precision', (this.testMetrics.precision * 100).toFixed(1) + '%');
            updateElement('test-recall', (this.testMetrics.recall * 100).toFixed(1) + '%');
            updateElement('test-f1', (this.testMetrics.f1 * 100).toFixed(1) + '%');
            updateElement('test-r2', this.testMetrics.r2.toFixed(4));
            updateElement('test-mse', this.testMetrics.mse.toFixed(6));
        }

        // Update confusion matrix display
        if (this.trainMetrics && this.trainMetrics.confusionMatrix) {
            const cm = this.trainMetrics.confusionMatrix;
            updateElement('cm-tp', cm.tp);
            updateElement('cm-fn', cm.fn);
            updateElement('cm-fp', cm.fp);
            updateElement('cm-tn', cm.tn);
        }
    }

    // Load an experiment configuration
    loadExperiment(experimentId) {
        if (typeof ExperimentsLibrary === 'undefined') return;

        const exp = ExperimentsLibrary.getById(experimentId);
        if (!exp) return;

        this.stop();

        // Apply configuration
        const config = exp.config;

        if (config.layers) {
            this.layerSizes = [...config.layers];
            const numOutputs = config.layers[config.layers.length - 1];

            // Set up output functions
            if (Array.isArray(config.targetFn)) {
                this.outputFunctions = [...config.targetFn];
            } else {
                this.outputFunctions = Array(numOutputs).fill(config.targetFn || 'sine');
            }
        }

        if (config.activation) this.activationName = config.activation;
        if (config.optimizer) this.optimizerName = config.optimizer;
        if (config.lr) this.learningRate = config.lr;
        if (config.loss) this.lossFunctionName = config.loss;
        if (config.init) this.weightInitName = config.init;

        // Rebuild with new config
        this.rebuildNetwork();

        // Show experiment info
        console.log(`Loaded experiment: ${exp.name}`);
        console.log(`Description: ${exp.description}`);
        console.log(`Expected: ${exp.expectedBehavior}`);
    }

    // Render experiments panel
    renderExperimentsPanel() {
        const container = document.getElementById('experiments-list');
        if (!container || typeof ExperimentsLibrary === 'undefined') return;

        container.innerHTML = '';

        const categories = ExperimentsLibrary.getCategories();

        categories.forEach(category => {
            const experiments = ExperimentsLibrary.getByCategory(category);

            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'exp-category';

            const header = document.createElement('div');
            header.className = 'exp-category-header';
            header.innerHTML = `<span>${category}</span> <span class="exp-count">(${experiments.length})</span>`;
            header.onclick = () => categoryDiv.classList.toggle('collapsed');

            const list = document.createElement('div');
            list.className = 'exp-list';

            experiments.forEach(exp => {
                const item = document.createElement('div');
                item.className = 'exp-item';
                item.innerHTML = `<strong>${exp.name}</strong><p>${exp.description}</p>`;
                item.onclick = () => this.loadExperiment(exp.id);
                list.appendChild(item);
            });

            categoryDiv.appendChild(header);
            categoryDiv.appendChild(list);
            container.appendChild(categoryDiv);
        });

        // Update total count
        const totalCount = document.querySelector('.exp-total-count');
        if (totalCount) {
            totalCount.textContent = `(${ExperimentsLibrary.getAll().length})`;
        }
    }

    // Initialize metrics UI (tabs and search)
    initMetricsUI() {
        // Metrics tab switching
        const tabs = document.querySelectorAll('.metrics-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.metrics-content').forEach(c => c.classList.remove('active'));

                // Add active to clicked tab and corresponding content
                tab.classList.add('active');
                const tabName = tab.dataset.tab;
                const content = document.getElementById(`metrics-${tabName}`);
                if (content) content.classList.add('active');
            });
        });

        // Experiment search
        const searchInput = document.getElementById('exp-search');
        if (searchInput && typeof ExperimentsLibrary !== 'undefined') {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const items = document.querySelectorAll('.exp-item');
                const categories = document.querySelectorAll('.exp-category');

                if (query === '') {
                    // Show all
                    items.forEach(item => item.style.display = '');
                    categories.forEach(cat => {
                        cat.style.display = '';
                        cat.classList.remove('collapsed');
                    });
                } else {
                    // Filter
                    items.forEach(item => {
                        const text = item.textContent.toLowerCase();
                        item.style.display = text.includes(query) ? '' : 'none';
                    });

                    // Hide empty categories
                    categories.forEach(cat => {
                        const visibleItems = cat.querySelectorAll('.exp-item:not([style*="display: none"])');
                        cat.style.display = visibleItems.length > 0 ? '' : 'none';
                        if (visibleItems.length > 0) {
                            cat.classList.remove('collapsed');
                        }
                    });
                }
            });
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
