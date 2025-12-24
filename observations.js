/**
 * Observation Table
 * Right-click on loss badge to log current configuration and metrics
 */

class ObservationsPanel {
    constructor() {
        this.observations = [];
        this.isExpanded = false;

        this.section = document.getElementById('observations-section');
        this.toggleBtn = document.getElementById('toggle-observations');
        this.tableBody = document.getElementById('observations-body');
        this.exportBtn = document.getElementById('export-observations');
        this.clearBtn = document.getElementById('clear-observations');

        this.setupEvents();
    }

    setupEvents() {
        this.toggleBtn.addEventListener('click', () => this.toggle());
        this.exportBtn.addEventListener('click', () => this.exportCSV());
        this.clearBtn.addEventListener('click', () => this.clear());

        // Toggle on header click
        document.querySelector('.observations-header').addEventListener('click', (e) => {
            if (!['BUTTON'].includes(e.target.tagName)) {
                this.toggle();
            }
        });

        // Right-click on loss badge to add observation
        const lossBadge = document.getElementById('current-loss');
        lossBadge.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.addObservation();
            // Show table if hidden
            if (!this.isExpanded) {
                this.toggle();
            }
        });
    }

    toggle() {
        this.isExpanded = !this.isExpanded;
        this.section.classList.toggle('collapsed', !this.isExpanded);
        this.toggleBtn.textContent = this.isExpanded ? '▲ Hide' : '▼ Show';
    }

    addObservation() {
        const app = window.app;
        if (!app || !app.network) return;

        // Get hidden layer configuration
        const hiddenLayers = app.layerSizes.slice(1, -1).join(',');

        // Calculate accuracy
        const accuracy = this.calculateAccuracy(app);

        const observation = {
            id: this.observations.length + 1,
            hiddenLayers: hiddenLayers || 'none',
            activation: app.activationName,
            lossFunction: app.lossFunctionName || 'mse',
            optimizer: app.optimizerName,
            weightInit: app.weightInitName || 'xavier',
            learningRate: app.learningRate,
            epoch: app.network.epoch,
            loss: app.network.lossHistory.length > 0
                ? app.network.lossHistory[app.network.lossHistory.length - 1]
                : 0,
            accuracy: accuracy,
            timestamp: new Date().toLocaleTimeString()
        };

        this.observations.push(observation);
        this.renderTable();

        // Flash effect on badge
        const badge = document.getElementById('current-loss');
        badge.style.animation = 'none';
        badge.offsetHeight; // Trigger reflow
        badge.style.animation = 'flash 0.3s ease-out';
    }

    calculateAccuracy(app) {
        if (!app.trainingInputs || !app.trainingTargets) return 0;

        let totalError = 0;
        let maxRange = 0;

        // Find max range in targets
        const targetMin = Math.min(...app.trainingTargets);
        const targetMax = Math.max(...app.trainingTargets);
        maxRange = Math.max(1, targetMax - targetMin);

        for (let i = 0; i < app.trainingInputs.length; i++) {
            const prediction = app.network.predict(app.trainingInputs[i]);
            const target = app.trainingTargets[i];
            totalError += Math.abs(prediction - target);
        }

        const avgError = totalError / app.trainingInputs.length;
        const accuracy = Math.max(0, (1 - avgError / maxRange) * 100);
        return accuracy;
    }

    renderTable() {
        this.tableBody.innerHTML = this.observations.map(obs => `
            <tr>
                <td>${obs.id}</td>
                <td>${obs.hiddenLayers}</td>
                <td>${obs.activation}</td>
                <td>${obs.lossFunction}</td>
                <td>${obs.optimizer}</td>
                <td>${obs.weightInit}</td>
                <td>${obs.learningRate}</td>
                <td>${obs.epoch}</td>
                <td>${obs.loss.toFixed(6)}</td>
                <td>${obs.accuracy.toFixed(2)}%</td>
                <td>${obs.timestamp}</td>
            </tr>
        `).join('');
    }

    exportCSV() {
        if (this.observations.length === 0) {
            alert('No observations to export');
            return;
        }

        const headers = ['ID', 'Hidden Layers', 'Activation', 'Loss Fn', 'Optimizer', 'Init', 'LR', 'Epoch', 'Loss', 'Accuracy', 'Timestamp'];
        const rows = this.observations.map(obs => [
            obs.id,
            obs.hiddenLayers,
            obs.activation,
            obs.lossFunction,
            obs.optimizer,
            obs.weightInit,
            obs.learningRate,
            obs.epoch,
            obs.loss.toFixed(6),
            obs.accuracy.toFixed(2) + '%',
            obs.timestamp
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `nn_observations_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();

        URL.revokeObjectURL(url);
    }

    clear() {
        if (this.observations.length > 0 && confirm('Clear all observations?')) {
            this.observations = [];
            this.renderTable();
        }
    }
}

// Export
window.ObservationsPanel = ObservationsPanel;
