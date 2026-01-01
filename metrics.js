/**
 * Metrics Engine
 * Classification-style metrics for regression using threshold-based accuracy
 */

const MetricsEngine = {
    /**
     * Calculate confusion matrix for regression using threshold
     * Predictions within threshold of target are considered "correct"
     * @param {Array} predictions - Array of predicted values
     * @param {Array} targets - Array of target values
     * @param {number} threshold - Tolerance threshold (default 0.1)
     * @returns {Object} Confusion matrix {tp, fp, tn, fn}
     */
    calculateConfusionMatrix(predictions, targets, threshold = 0.1) {
        let tp = 0; // True Positive: correctly predicted within threshold
        let fp = 0; // False Positive: predicted positive but was negative
        let tn = 0; // True Negative: correctly predicted negative
        let fn = 0; // False Negative: predicted negative but was positive

        // For regression, we use a binned approach:
        // Divide the output range into bins and check if prediction lands in correct bin
        const targetMin = Math.min(...targets);
        const targetMax = Math.max(...targets);
        const range = Math.max(1, targetMax - targetMin);

        for (let i = 0; i < predictions.length; i++) {
            const pred = Array.isArray(predictions[i]) ? predictions[i][0] : predictions[i];
            const target = Array.isArray(targets[i]) ? targets[i][0] : targets[i];

            const error = Math.abs(pred - target);
            const normalizedError = error / range;

            // Within threshold = correct prediction
            const isCorrect = normalizedError <= threshold;

            // For binary confusion matrix in regression context:
            // We check if prediction "agrees" with target direction from mean
            const mean = (targetMin + targetMax) / 2;
            const targetPositive = target >= mean;
            const predPositive = pred >= mean;

            if (isCorrect) {
                if (targetPositive) tp++;
                else tn++;
            } else {
                if (targetPositive && !predPositive) fn++;
                else if (!targetPositive && predPositive) fp++;
                else if (targetPositive) tp++; // Wrong magnitude but right direction
                else tn++;
            }
        }

        return { tp, fp, tn, fn };
    },

    /**
     * Calculate precision: TP / (TP + FP)
     */
    calculatePrecision(tp, fp) {
        if (tp + fp === 0) return 0;
        return tp / (tp + fp);
    },

    /**
     * Calculate recall: TP / (TP + FN)
     */
    calculateRecall(tp, fn) {
        if (tp + fn === 0) return 0;
        return tp / (tp + fn);
    },

    /**
     * Calculate F1 score: 2 * (precision * recall) / (precision + recall)
     */
    calculateF1(precision, recall) {
        if (precision + recall === 0) return 0;
        return 2 * (precision * recall) / (precision + recall);
    },

    /**
     * Calculate accuracy: (TP + TN) / Total
     */
    calculateAccuracyFromCM(tp, tn, fp, fn) {
        const total = tp + tn + fp + fn;
        if (total === 0) return 0;
        return (tp + tn) / total;
    },

    /**
     * Calculate Mean Squared Error
     */
    calculateMSE(predictions, targets) {
        if (predictions.length === 0) return 0;

        let sum = 0;
        for (let i = 0; i < predictions.length; i++) {
            const pred = Array.isArray(predictions[i]) ? predictions[i][0] : predictions[i];
            const target = Array.isArray(targets[i]) ? targets[i][0] : targets[i];
            sum += Math.pow(pred - target, 2);
        }
        return sum / predictions.length;
    },

    /**
     * Calculate Mean Absolute Error
     */
    calculateMAE(predictions, targets) {
        if (predictions.length === 0) return 0;

        let sum = 0;
        for (let i = 0; i < predictions.length; i++) {
            const pred = Array.isArray(predictions[i]) ? predictions[i][0] : predictions[i];
            const target = Array.isArray(targets[i]) ? targets[i][0] : targets[i];
            sum += Math.abs(pred - target);
        }
        return sum / predictions.length;
    },

    /**
     * Calculate R-squared (coefficient of determination)
     */
    calculateR2(predictions, targets) {
        if (predictions.length === 0) return 0;

        // Calculate mean of targets
        let targetSum = 0;
        for (let i = 0; i < targets.length; i++) {
            const target = Array.isArray(targets[i]) ? targets[i][0] : targets[i];
            targetSum += target;
        }
        const targetMean = targetSum / targets.length;

        // Calculate SS_res and SS_tot
        let ssRes = 0;
        let ssTot = 0;
        for (let i = 0; i < predictions.length; i++) {
            const pred = Array.isArray(predictions[i]) ? predictions[i][0] : predictions[i];
            const target = Array.isArray(targets[i]) ? targets[i][0] : targets[i];
            ssRes += Math.pow(target - pred, 2);
            ssTot += Math.pow(target - targetMean, 2);
        }

        if (ssTot === 0) return 1;
        return 1 - (ssRes / ssTot);
    },

    /**
     * Calculate all metrics at once
     */
    calculateAllMetrics(predictions, targets, threshold = 0.1) {
        const cm = this.calculateConfusionMatrix(predictions, targets, threshold);
        const precision = this.calculatePrecision(cm.tp, cm.fp);
        const recall = this.calculateRecall(cm.tp, cm.fn);
        const f1 = this.calculateF1(precision, recall);
        const accuracy = this.calculateAccuracyFromCM(cm.tp, cm.tn, cm.fp, cm.fn);
        const mse = this.calculateMSE(predictions, targets);
        const mae = this.calculateMAE(predictions, targets);
        const r2 = this.calculateR2(predictions, targets);

        return {
            confusionMatrix: cm,
            precision,
            recall,
            f1,
            accuracy,
            mse,
            mae,
            r2
        };
    },

    /**
     * Format confusion matrix as string for display
     */
    formatConfusionMatrix(cm) {
        return `
        Predicted
        +     -
    +  ${cm.tp.toString().padStart(3)}   ${cm.fn.toString().padStart(3)}   Actual
    -  ${cm.fp.toString().padStart(3)}   ${cm.tn.toString().padStart(3)}
        `;
    }
};

// Export
window.MetricsEngine = MetricsEngine;
