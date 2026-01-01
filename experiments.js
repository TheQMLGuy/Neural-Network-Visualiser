/**
 * Experiments Library
 * 100+ pre-configured learning scenarios for educational purposes
 */

const ExperimentsLibrary = {
    experiments: [
        // ============================================
        // VANISHING GRADIENT (10 experiments)
        // ============================================
        {
            id: 'vg_01',
            category: 'Vanishing Gradient',
            name: 'Deep Sigmoid Network',
            description: 'Deep network with sigmoid activations shows vanishing gradients - early layers barely update.',
            config: { layers: [1, 8, 8, 8, 8, 1], activation: 'sigmoid', optimizer: 'sgd', lr: 0.1, targetFn: 'sine' },
            expectedBehavior: 'Very slow learning, gradients shrink exponentially through layers'
        },
        {
            id: 'vg_02',
            category: 'Vanishing Gradient',
            name: 'Sigmoid vs ReLU Comparison',
            description: 'Compare same architecture with sigmoid vs ReLU to see gradient flow difference.',
            config: { layers: [1, 8, 8, 8, 1], activation: 'sigmoid', optimizer: 'sgd', lr: 0.1, targetFn: 'sine' },
            compareWith: { activation: 'relu' },
            expectedBehavior: 'ReLU learns much faster due to constant gradients'
        },
        {
            id: 'vg_03',
            category: 'Vanishing Gradient',
            name: 'Tanh Saturation',
            description: 'Tanh saturates at ±1, causing vanishing gradients for large inputs.',
            config: { layers: [1, 16, 16, 1], activation: 'tanh', optimizer: 'sgd', lr: 0.05, targetFn: 'quadratic' },
            expectedBehavior: 'Slow convergence due to saturation in deep layers'
        },
        {
            id: 'vg_04',
            category: 'Vanishing Gradient',
            name: 'Very Deep Sigmoid (6 layers)',
            description: 'Extreme case: 6 hidden layers with sigmoid.',
            config: { layers: [1, 4, 4, 4, 4, 4, 4, 1], activation: 'sigmoid', optimizer: 'sgd', lr: 0.5, targetFn: 'sine' },
            expectedBehavior: 'Nearly no learning - gradients vanish completely'
        },
        {
            id: 'vg_05',
            category: 'Vanishing Gradient',
            name: 'Solution: Adam Optimizer',
            description: 'Adam helps mitigate vanishing gradients with adaptive learning rates.',
            config: { layers: [1, 8, 8, 8, 1], activation: 'sigmoid', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Much faster learning than SGD with same architecture'
        },
        {
            id: 'vg_06',
            category: 'Vanishing Gradient',
            name: 'Solution: Use SELU',
            description: 'SELU self-normalizes, preventing vanishing gradients in deep nets.',
            config: { layers: [1, 8, 8, 8, 8, 1], activation: 'selu', optimizer: 'sgd', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Stable training even in deep networks'
        },
        {
            id: 'vg_07',
            category: 'Vanishing Gradient',
            name: 'Shallow vs Deep Comparison',
            description: 'Compare 2-layer vs 5-layer sigmoid network learning speed.',
            config: { layers: [1, 16, 1], activation: 'sigmoid', optimizer: 'sgd', lr: 0.1, targetFn: 'sine' },
            compareWith: { layers: [1, 8, 8, 8, 8, 1] },
            expectedBehavior: 'Shallow learns quickly, deep struggles'
        },
        {
            id: 'vg_08',
            category: 'Vanishing Gradient',
            name: 'LeakyReLU Solution',
            description: 'LeakyReLU prevents both vanishing and dying ReLU problems.',
            config: { layers: [1, 8, 8, 8, 1], activation: 'leaky_relu', optimizer: 'sgd', lr: 0.01, targetFn: 'gaussian' },
            expectedBehavior: 'Consistent learning with non-zero gradients'
        },
        {
            id: 'vg_09',
            category: 'Vanishing Gradient',
            name: 'Mish Activation',
            description: 'Mish is smooth and non-monotonic, helping gradient flow.',
            config: { layers: [1, 8, 8, 8, 1], activation: 'mish', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Smooth learning curve, no vanishing'
        },
        {
            id: 'vg_10',
            category: 'Vanishing Gradient',
            name: 'Swish vs Sigmoid',
            description: 'Swish (x * sigmoid(x)) has better gradient properties than sigmoid.',
            config: { layers: [1, 8, 8, 8, 1], activation: 'swish', optimizer: 'sgd', lr: 0.05, targetFn: 'sine' },
            expectedBehavior: 'Better gradient flow than pure sigmoid'
        },

        // ============================================
        // EXPLODING GRADIENTS (5 experiments)
        // ============================================
        {
            id: 'eg_01',
            category: 'Exploding Gradient',
            name: 'High Learning Rate',
            description: 'Learning rate too high causes gradients to explode.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'sgd', lr: 1.0, targetFn: 'sine' },
            expectedBehavior: 'Loss oscillates wildly or goes to infinity'
        },
        {
            id: 'eg_02',
            category: 'Exploding Gradient',
            name: 'Very High LR + Deep Net',
            description: 'Combining high LR with deep network amplifies explosion.',
            config: { layers: [1, 8, 8, 8, 8, 1], activation: 'relu', optimizer: 'sgd', lr: 0.5, targetFn: 'quadratic' },
            expectedBehavior: 'Network diverges rapidly'
        },
        {
            id: 'eg_03',
            category: 'Exploding Gradient',
            name: 'Solution: Gradient Clipping (Lower LR)',
            description: 'Using appropriate learning rate prevents explosion.',
            config: { layers: [1, 8, 8, 8, 1], activation: 'relu', optimizer: 'sgd', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Stable learning with controlled gradients'
        },
        {
            id: 'eg_04',
            category: 'Exploding Gradient',
            name: 'Adam Stabilizes Training',
            description: 'Adam adaptive LR helps prevent explosions.',
            config: { layers: [1, 8, 8, 8, 1], activation: 'relu', optimizer: 'adam', lr: 0.1, targetFn: 'sine' },
            expectedBehavior: 'Adam adapts even with high initial LR'
        },
        {
            id: 'eg_05',
            category: 'Exploding Gradient',
            name: 'ELU Stability',
            description: 'ELU bounded negative region helps stability.',
            config: { layers: [1, 8, 8, 1], activation: 'elu', optimizer: 'sgd', lr: 0.1, targetFn: 'sine' },
            expectedBehavior: 'More stable than unbounded ReLU'
        },

        // ============================================
        // LEARNING RATE (12 experiments)
        // ============================================
        {
            id: 'lr_01',
            category: 'Learning Rate',
            name: 'LR Too High (0.5)',
            description: 'Learning rate at 0.5 is too aggressive for most problems.',
            config: { layers: [1, 8, 8, 1], activation: 'sigmoid', optimizer: 'sgd', lr: 0.5, targetFn: 'sine' },
            expectedBehavior: 'Oscillating loss, may not converge'
        },
        {
            id: 'lr_02',
            category: 'Learning Rate',
            name: 'LR Optimal (0.01)',
            description: 'Learning rate 0.01 is often a good starting point.',
            config: { layers: [1, 8, 8, 1], activation: 'sigmoid', optimizer: 'sgd', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Smooth, consistent learning'
        },
        {
            id: 'lr_03',
            category: 'Learning Rate',
            name: 'LR Too Low (0.0001)',
            description: 'Learning rate too small = very slow progress.',
            config: { layers: [1, 8, 8, 1], activation: 'sigmoid', optimizer: 'sgd', lr: 0.0001, targetFn: 'sine' },
            expectedBehavior: 'Extremely slow learning, may seem stuck'
        },
        {
            id: 'lr_04',
            category: 'Learning Rate',
            name: 'SGD vs Adam at Same LR',
            description: 'Adam uses adaptive LR, so starting LR matters less.',
            config: { layers: [1, 8, 1], activation: 'relu', optimizer: 'sgd', lr: 0.01, targetFn: 'sine' },
            compareWith: { optimizer: 'adam' },
            expectedBehavior: 'Adam typically converges faster'
        },
        {
            id: 'lr_05',
            category: 'Learning Rate',
            name: 'Momentum Helps (0.9)',
            description: 'Momentum accelerates learning in consistent directions.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'momentum', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Faster than vanilla SGD'
        },
        {
            id: 'lr_06',
            category: 'Learning Rate',
            name: 'RMSprop Adaptive',
            description: 'RMSprop adapts per-parameter learning rates.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'rmsprop', lr: 0.01, targetFn: 'gaussian' },
            expectedBehavior: 'Good for non-stationary objectives'
        },
        {
            id: 'lr_07',
            category: 'Learning Rate',
            name: 'Nadam = Nesterov + Adam',
            description: 'Nadam combines Nesterov momentum with Adam.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'nadam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Often fastest convergence'
        },
        {
            id: 'lr_08',
            category: 'Learning Rate',
            name: 'AdaGrad Accumulates',
            description: 'AdaGrad accumulates gradients, may slow over time.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'adagrad', lr: 0.1, targetFn: 'sine' },
            expectedBehavior: 'Fast start, may plateau'
        },
        {
            id: 'lr_09',
            category: 'Learning Rate',
            name: 'Tiny LR + Many Epochs',
            description: 'Can you converge with LR=0.001 given enough time?',
            config: { layers: [1, 8, 1], activation: 'tanh', optimizer: 'sgd', lr: 0.001, targetFn: 'linear' },
            expectedBehavior: 'Yes, but very slowly'
        },
        {
            id: 'lr_10',
            category: 'Learning Rate',
            name: 'Large LR + Simple Problem',
            description: 'Simple linear problem can handle higher LR.',
            config: { layers: [1, 4, 1], activation: 'linear', optimizer: 'sgd', lr: 0.1, targetFn: 'linear' },
            expectedBehavior: 'Quick convergence, no oscillation'
        },
        {
            id: 'lr_11',
            category: 'Learning Rate',
            name: 'Complex Function Needs Lower LR',
            description: 'Harder functions benefit from careful learning.',
            config: { layers: [1, 16, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.001, targetFn: 'chirp' },
            expectedBehavior: 'Stable learning on complex patterns'
        },
        {
            id: 'lr_12',
            category: 'Learning Rate',
            name: 'LR Comparison: 0.1 vs 0.01 vs 0.001',
            description: 'See the effect of different learning rates.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'sgd', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Middle ground often best'
        },

        // ============================================
        // ACTIVATION FUNCTIONS (15 experiments)
        // ============================================
        {
            id: 'act_01',
            category: 'Activation Functions',
            name: 'Sigmoid Saturation',
            description: 'Sigmoid outputs between 0-1, saturates at extremes.',
            config: { layers: [1, 8, 8, 1], activation: 'sigmoid', optimizer: 'adam', lr: 0.01, targetFn: 'step' },
            expectedBehavior: 'Good for bounded outputs, slow for large inputs'
        },
        {
            id: 'act_02',
            category: 'Activation Functions',
            name: 'Tanh Zero-Centered',
            description: 'Tanh outputs -1 to 1, zero-centered which helps learning.',
            config: { layers: [1, 8, 8, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Often better than sigmoid for hidden layers'
        },
        {
            id: 'act_03',
            category: 'Activation Functions',
            name: 'ReLU Speed',
            description: 'ReLU is simple and fast, but can die.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'adam', lr: 0.01, targetFn: 'quadratic' },
            expectedBehavior: 'Fast training, may have dead neurons'
        },
        {
            id: 'act_04',
            category: 'Activation Functions',
            name: 'Dying ReLU Problem',
            description: 'With negative inputs, ReLU neurons can die (always output 0).',
            config: { layers: [1, 16, 1], activation: 'relu', optimizer: 'sgd', lr: 0.1, targetFn: 'leaky' },
            expectedBehavior: 'Some neurons may become inactive'
        },
        {
            id: 'act_05',
            category: 'Activation Functions',
            name: 'LeakyReLU Prevents Death',
            description: 'Small negative slope keeps neurons alive.',
            config: { layers: [1, 16, 1], activation: 'leaky_relu', optimizer: 'sgd', lr: 0.1, targetFn: 'leaky' },
            expectedBehavior: 'All neurons contribute'
        },
        {
            id: 'act_06',
            category: 'Activation Functions',
            name: 'ELU Smooth Negative',
            description: 'ELU has smooth exponential for negative inputs.',
            config: { layers: [1, 8, 8, 1], activation: 'elu', optimizer: 'adam', lr: 0.01, targetFn: 'gaussian' },
            expectedBehavior: 'Smooth gradients, faster learning'
        },
        {
            id: 'act_07',
            category: 'Activation Functions',
            name: 'SELU Self-Normalizing',
            description: 'SELU maintains mean ~0, variance ~1 through layers.',
            config: { layers: [1, 8, 8, 8, 1], activation: 'selu', optimizer: 'sgd', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Stable deep network training'
        },
        {
            id: 'act_08',
            category: 'Activation Functions',
            name: 'Swish: x * sigmoid(x)',
            description: 'Swish is smooth and non-monotonic.',
            config: { layers: [1, 8, 8, 1], activation: 'swish', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Good performance on many tasks'
        },
        {
            id: 'act_09',
            category: 'Activation Functions',
            name: 'GELU (Transformer Favorite)',
            description: 'GELU is used in BERT, GPT models.',
            config: { layers: [1, 8, 8, 1], activation: 'gelu', optimizer: 'adam', lr: 0.01, targetFn: 'gabor' },
            expectedBehavior: 'Smooth, probabilistic activation'
        },
        {
            id: 'act_10',
            category: 'Activation Functions',
            name: 'Mish Smooth Non-Monotonic',
            description: 'Mish: x * tanh(softplus(x))',
            config: { layers: [1, 8, 8, 1], activation: 'mish', optimizer: 'adam', lr: 0.01, targetFn: 'morlet' },
            expectedBehavior: 'State-of-art activation function'
        },
        {
            id: 'act_11',
            category: 'Activation Functions',
            name: 'Softplus Smooth ReLU',
            description: 'Softplus is smooth approximation of ReLU.',
            config: { layers: [1, 8, 8, 1], activation: 'softplus', optimizer: 'adam', lr: 0.01, targetFn: 'rectified_sine' },
            expectedBehavior: 'Smooth, always non-zero gradient'
        },
        {
            id: 'act_12',
            category: 'Activation Functions',
            name: 'Softsign Bounded',
            description: 'Softsign: x/(1+|x|), bounded like tanh but different shape.',
            config: { layers: [1, 8, 8, 1], activation: 'softsign', optimizer: 'adam', lr: 0.01, targetFn: 'tanh_like' },
            expectedBehavior: 'Bounded output, no saturation'
        },
        {
            id: 'act_13',
            category: 'Activation Functions',
            name: 'PReLU Learnable Slope',
            description: 'PReLU has learnable negative slope (here fixed at 0.25).',
            config: { layers: [1, 8, 8, 1], activation: 'prelu', optimizer: 'adam', lr: 0.01, targetFn: 'asymm_peak' },
            expectedBehavior: 'Flexible negative response'
        },
        {
            id: 'act_14',
            category: 'Activation Functions',
            name: 'CELU Continuous',
            description: 'CELU is continuously differentiable ELU variant.',
            config: { layers: [1, 8, 8, 1], activation: 'celu', optimizer: 'adam', lr: 0.01, targetFn: 'double_gaussian' },
            expectedBehavior: 'Smooth everywhere'
        },
        {
            id: 'act_15',
            category: 'Activation Functions',
            name: 'Linear (No Activation)',
            description: 'Without activation, deep = shallow (just linear transform).',
            config: { layers: [1, 8, 8, 8, 1], activation: 'linear', optimizer: 'adam', lr: 0.01, targetFn: 'linear' },
            expectedBehavior: 'Can only learn linear functions'
        },

        // ============================================
        // OVERFITTING (10 experiments)
        // ============================================
        {
            id: 'of_01',
            category: 'Overfitting',
            name: 'Too Many Parameters',
            description: 'Network with way more params than data points.',
            config: { layers: [1, 16, 16, 16, 1], activation: 'relu', optimizer: 'adam', lr: 0.01, targetFn: 'single_peak' },
            expectedBehavior: 'May memorize noise, poor generalization'
        },
        {
            id: 'of_02',
            category: 'Overfitting',
            name: 'Simple Problem, Complex Net',
            description: 'Linear problem with massive network.',
            config: { layers: [1, 16, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'linear' },
            expectedBehavior: 'Wastes capacity, may overfit'
        },
        {
            id: 'of_03',
            category: 'Overfitting',
            name: 'High Capacity + Few Data',
            description: 'Train loss goes to zero, but network won\'t generalize.',
            config: { layers: [1, 32, 32, 1], activation: 'relu', optimizer: 'adam', lr: 0.01, targetFn: 'gaussian' },
            expectedBehavior: 'Perfect train loss, potentially wiggly curve'
        },
        {
            id: 'of_04',
            category: 'Overfitting',
            name: 'Train Too Long',
            description: 'Training forever can lead to overfitting.',
            config: { layers: [1, 16, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.001, targetFn: 'sine' },
            expectedBehavior: 'Watch val loss diverge from train loss'
        },
        {
            id: 'of_05',
            category: 'Overfitting',
            name: 'Comparison: Proper Size',
            description: 'Right-sized network for the problem.',
            config: { layers: [1, 8, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Good generalization'
        },
        {
            id: 'of_06',
            category: 'Overfitting',
            name: 'Early Stopping Concept',
            description: 'Stop when validation loss stops improving.',
            config: { layers: [1, 16, 16, 1], activation: 'relu', optimizer: 'adam', lr: 0.01, targetFn: 'gaussian' },
            expectedBehavior: 'Watch for val loss plateau'
        },
        {
            id: 'of_07',
            category: 'Overfitting',
            name: 'Noise Fitting Demo',
            description: 'Large net tries to fit every data point exactly.',
            config: { layers: [1, 32, 32, 1], activation: 'swish', optimizer: 'adam', lr: 0.001, targetFn: 'zigzag' },
            expectedBehavior: 'Wiggly interpolation between points'
        },
        {
            id: 'of_08',
            category: 'Overfitting',
            name: 'Wide vs Deep Capacity',
            description: 'One wide layer vs many narrow layers.',
            config: { layers: [1, 64, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            compareWith: { layers: [1, 8, 8, 8, 8, 1] },
            expectedBehavior: 'Both can overfit differently'
        },
        {
            id: 'of_09',
            category: 'Overfitting',
            name: 'Complex Target Easy Overfit',
            description: 'Complex targets require more data, easier to overfit.',
            config: { layers: [1, 16, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'interference' },
            expectedBehavior: 'Train loss low, curve may be wrong'
        },
        {
            id: 'of_10',
            category: 'Overfitting',
            name: 'Regularization: Smaller Network',
            description: 'Simpler architecture as implicit regularization.',
            config: { layers: [1, 4, 4, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Less overfitting, smoother curve'
        },

        // ============================================
        // UNDERFITTING (8 experiments)
        // ============================================
        {
            id: 'uf_01',
            category: 'Underfitting',
            name: 'Network Too Small',
            description: 'Not enough capacity to learn the function.',
            config: { layers: [1, 2, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Cannot fit the curve well'
        },
        {
            id: 'uf_02',
            category: 'Underfitting',
            name: 'Linear for Nonlinear Task',
            description: 'Linear activation can\'t learn nonlinear functions.',
            config: { layers: [1, 16, 16, 1], activation: 'linear', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Best fit is a straight line'
        },
        {
            id: 'uf_03',
            category: 'Underfitting',
            name: 'Not Enough Training',
            description: 'Training for too few epochs.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'sgd', lr: 0.001, targetFn: 'sine' },
            expectedBehavior: 'Curve barely moves from initial'
        },
        {
            id: 'uf_04',
            category: 'Underfitting',
            name: 'LR Too Low',
            description: 'Learning rate so low it barely learns.',
            config: { layers: [1, 8, 8, 1], activation: 'tanh', optimizer: 'sgd', lr: 0.00001, targetFn: 'sine' },
            expectedBehavior: 'Essentially no learning visible'
        },
        {
            id: 'uf_05',
            category: 'Underfitting',
            name: 'Wrong Activation for Task',
            description: 'Sigmoid for unbounded regression task.',
            config: { layers: [1, 8, 1], activation: 'sigmoid', optimizer: 'adam', lr: 0.01, targetFn: 'cubic' },
            expectedBehavior: 'Bounded output can\'t reach target values'
        },
        {
            id: 'uf_06',
            category: 'Underfitting',
            name: 'Simple Net vs Complex Function',
            description: '2-node hidden layer for complex function.',
            config: { layers: [1, 2, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'gabor' },
            expectedBehavior: 'Fundamental underfitting'
        },
        {
            id: 'uf_07',
            category: 'Underfitting',
            name: 'Fixed: Add Capacity',
            description: 'Solution: increase network size.',
            config: { layers: [1, 16, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'gabor' },
            expectedBehavior: 'Now has enough capacity'
        },
        {
            id: 'uf_08',
            category: 'Underfitting',
            name: 'Dead Neurons Issue',
            description: 'Many ReLU neurons dead = underfitting.',
            config: { layers: [1, 16, 1], activation: 'relu', optimizer: 'sgd', lr: 0.5, targetFn: 'sine' },
            expectedBehavior: 'Large LR kills neurons, reduces capacity'
        },

        // ============================================
        // ARCHITECTURE (15 experiments)
        // ============================================
        {
            id: 'arch_01',
            category: 'Architecture',
            name: 'Single Hidden Layer',
            description: 'Universal approximator with one layer.',
            config: { layers: [1, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Can approximate any continuous function'
        },
        {
            id: 'arch_02',
            category: 'Architecture',
            name: 'Wide and Shallow',
            description: '32 neurons in single layer.',
            config: { layers: [1, 32, 1], activation: 'relu', optimizer: 'adam', lr: 0.01, targetFn: 'gaussian' },
            expectedBehavior: 'High capacity in one layer'
        },
        {
            id: 'arch_03',
            category: 'Architecture',
            name: 'Narrow and Deep',
            description: '4 neurons but 5 layers.',
            config: { layers: [1, 4, 4, 4, 4, 4, 1], activation: 'relu', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Learns hierarchical features'
        },
        {
            id: 'arch_04',
            category: 'Architecture',
            name: 'Pyramid Shape',
            description: 'Wider at input, narrower at output.',
            config: { layers: [1, 16, 8, 4, 1], activation: 'relu', optimizer: 'adam', lr: 0.01, targetFn: 'gaussian' },
            expectedBehavior: 'Common architecture pattern'
        },
        {
            id: 'arch_05',
            category: 'Architecture',
            name: 'Inverse Pyramid',
            description: 'Narrower at input, wider later.',
            config: { layers: [1, 4, 8, 16, 1], activation: 'relu', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Expands representation'
        },
        {
            id: 'arch_06',
            category: 'Architecture',
            name: 'Bottleneck',
            description: 'Wide-narrow-wide like autoencoder.',
            config: { layers: [1, 16, 4, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Forces compression of information'
        },
        {
            id: 'arch_07',
            category: 'Architecture',
            name: 'Uniform Width',
            description: 'Same width throughout.',
            config: { layers: [1, 8, 8, 8, 8, 1], activation: 'relu', optimizer: 'adam', lr: 0.01, targetFn: 'morlet' },
            expectedBehavior: 'Common choice for simplicity'
        },
        {
            id: 'arch_08',
            category: 'Architecture',
            name: 'Minimal: 1-2-1',
            description: 'Smallest network possible.',
            config: { layers: [1, 2, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'step' },
            expectedBehavior: 'Very limited capacity'
        },
        {
            id: 'arch_09',
            category: 'Architecture',
            name: 'Large: 1-32-32-1',
            description: 'Generous capacity.',
            config: { layers: [1, 32, 32, 1], activation: 'relu', optimizer: 'adam', lr: 0.01, targetFn: 'chirp' },
            expectedBehavior: 'Good for complex functions'
        },
        {
            id: 'arch_10',
            category: 'Architecture',
            name: 'Match Complexity',
            description: 'Size network to match task complexity.',
            config: { layers: [1, 8, 8, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Balanced capacity and efficiency'
        },
        {
            id: 'arch_11',
            category: 'Architecture',
            name: 'Depth Experiment: 2 layers',
            description: '2 hidden layers of 8 neurons.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'adam', lr: 0.01, targetFn: 'wave_packet' },
            expectedBehavior: 'Basic deep network'
        },
        {
            id: 'arch_12',
            category: 'Architecture',
            name: 'Depth Experiment: 4 layers',
            description: '4 hidden layers of 8 neurons.',
            config: { layers: [1, 8, 8, 8, 8, 1], activation: 'relu', optimizer: 'adam', lr: 0.01, targetFn: 'wave_packet' },
            expectedBehavior: 'Deeper feature learning'
        },
        {
            id: 'arch_13',
            category: 'Architecture',
            name: 'Width vs Depth Trade-off',
            description: 'Same param count: 1x64 vs 4x8.',
            config: { layers: [1, 64, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'ripple' },
            compareWith: { layers: [1, 8, 8, 8, 8, 1] },
            expectedBehavior: 'Different learning dynamics'
        },
        {
            id: 'arch_14',
            category: 'Architecture',
            name: 'Multi-Output: 2 Outputs',
            description: 'Network predicting 2 functions simultaneously.',
            config: { layers: [1, 8, 8, 2], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: ['sine', 'cosine'] },
            expectedBehavior: 'Shared representation learning'
        },
        {
            id: 'arch_15',
            category: 'Architecture',
            name: 'Multi-Output: 4 Outputs',
            description: 'Network predicting 4 different functions.',
            config: { layers: [1, 16, 16, 4], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: ['sine', 'cosine', 'quadratic', 'gaussian'] },
            expectedBehavior: 'Multi-task learning'
        },

        // ============================================
        // OPTIMIZERS (10 experiments)
        // ============================================
        {
            id: 'opt_01',
            category: 'Optimizers',
            name: 'Vanilla SGD',
            description: 'Basic stochastic gradient descent.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'sgd', lr: 0.1, targetFn: 'sine' },
            expectedBehavior: 'Noisy, slow convergence'
        },
        {
            id: 'opt_02',
            category: 'Optimizers',
            name: 'SGD + Momentum',
            description: 'Momentum accelerates learning.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'momentum', lr: 0.1, targetFn: 'sine' },
            expectedBehavior: 'Faster than vanilla SGD'
        },
        {
            id: 'opt_03',
            category: 'Optimizers',
            name: 'RMSprop Adaptive',
            description: 'Adapts learning rate per parameter.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'rmsprop', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Good for non-stationary problems'
        },
        {
            id: 'opt_04',
            category: 'Optimizers',
            name: 'Adam (Default Choice)',
            description: 'Combines momentum and RMSprop.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Most popular optimizer'
        },
        {
            id: 'opt_05',
            category: 'Optimizers',
            name: 'AdaGrad',
            description: 'Accumulates squared gradients.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'adagrad', lr: 0.1, targetFn: 'sine' },
            expectedBehavior: 'Effective LR decays over time'
        },
        {
            id: 'opt_06',
            category: 'Optimizers',
            name: 'Nadam',
            description: 'Adam + Nesterov momentum.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'nadam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Often fastest convergence'
        },
        {
            id: 'opt_07',
            category: 'Optimizers',
            name: 'SGD vs Adam Race',
            description: 'Compare convergence speed.',
            config: { layers: [1, 8, 8, 1], activation: 'tanh', optimizer: 'sgd', lr: 0.1, targetFn: 'gaussian' },
            compareWith: { optimizer: 'adam', lr: 0.01 },
            expectedBehavior: 'Adam typically wins'
        },
        {
            id: 'opt_08',
            category: 'Optimizers',
            name: 'Momentum vs RMSprop',
            description: 'Compare adaptive vs fixed momentum.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'momentum', lr: 0.05, targetFn: 'sine' },
            compareWith: { optimizer: 'rmsprop', lr: 0.01 },
            expectedBehavior: 'RMSprop adapts better'
        },
        {
            id: 'opt_09',
            category: 'Optimizers',
            name: 'Hard Problem: Adam Shines',
            description: 'Complex function benefits from Adam.',
            config: { layers: [1, 16, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'interference' },
            expectedBehavior: 'Adaptive LR handles complexity'
        },
        {
            id: 'opt_10',
            category: 'Optimizers',
            name: 'Simple Problem: SGD OK',
            description: 'For easy problems, SGD works fine.',
            config: { layers: [1, 4, 1], activation: 'tanh', optimizer: 'sgd', lr: 0.1, targetFn: 'linear' },
            expectedBehavior: 'Quick convergence with SGD'
        },

        // ============================================
        // LOSS FUNCTIONS (6 experiments)
        // ============================================
        {
            id: 'loss_01',
            category: 'Loss Functions',
            name: 'MSE Standard',
            description: 'Mean Squared Error - the default.',
            config: { layers: [1, 8, 8, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine', loss: 'mse' },
            expectedBehavior: 'Penalizes large errors heavily'
        },
        {
            id: 'loss_02',
            category: 'Loss Functions',
            name: 'MAE Robust',
            description: 'Mean Absolute Error - more robust to outliers.',
            config: { layers: [1, 8, 8, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine', loss: 'mae' },
            expectedBehavior: 'Linear penalty, less outlier sensitive'
        },
        {
            id: 'loss_03',
            category: 'Loss Functions',
            name: 'Huber Loss',
            description: 'Best of both: MSE for small, MAE for large errors.',
            config: { layers: [1, 8, 8, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'step', loss: 'huber' },
            expectedBehavior: 'Robust yet smooth'
        },
        {
            id: 'loss_04',
            category: 'Loss Functions',
            name: 'Log-Cosh Smooth',
            description: 'Similar to Huber but twice differentiable.',
            config: { layers: [1, 8, 8, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'gaussian', loss: 'log_cosh' },
            expectedBehavior: 'Very smooth gradients'
        },
        {
            id: 'loss_05',
            category: 'Loss Functions',
            name: 'MSE on Discontinuity',
            description: 'MSE struggles with step functions.',
            config: { layers: [1, 16, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'step', loss: 'mse' },
            expectedBehavior: 'Sigmoid-like approximation'
        },
        {
            id: 'loss_06',
            category: 'Loss Functions',
            name: 'Huber on Discontinuity',
            description: 'Huber may handle steps differently.',
            config: { layers: [1, 16, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'step', loss: 'huber' },
            expectedBehavior: 'Sharper transition possible'
        },

        // ============================================
        // WEIGHT INITIALIZATION (8 experiments)
        // ============================================
        {
            id: 'init_01',
            category: 'Weight Init',
            name: 'Xavier/Glorot',
            description: 'Standard initialization for sigmoid/tanh.',
            config: { layers: [1, 8, 8, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine', init: 'xavier' },
            expectedBehavior: 'Maintains variance through layers'
        },
        {
            id: 'init_02',
            category: 'Weight Init',
            name: 'He Init for ReLU',
            description: 'Designed for ReLU activations.',
            config: { layers: [1, 8, 8, 1], activation: 'relu', optimizer: 'adam', lr: 0.01, targetFn: 'sine', init: 'he' },
            expectedBehavior: 'Accounts for ReLU positive-only output'
        },
        {
            id: 'init_03',
            category: 'Weight Init',
            name: 'LeCun Init',
            description: 'For SELU and self-normalizing networks.',
            config: { layers: [1, 8, 8, 1], activation: 'selu', optimizer: 'adam', lr: 0.01, targetFn: 'sine', init: 'lecun' },
            expectedBehavior: 'Maintains self-normalization'
        },
        {
            id: 'init_04',
            category: 'Weight Init',
            name: 'Uniform Random',
            description: 'Simple uniform [-1, 1] initialization.',
            config: { layers: [1, 8, 8, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine', init: 'uniform' },
            expectedBehavior: 'May have variance issues'
        },
        {
            id: 'init_05',
            category: 'Weight Init',
            name: 'Normal Small',
            description: 'Normal distribution with std=0.1.',
            config: { layers: [1, 8, 8, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine', init: 'normal' },
            expectedBehavior: 'Small initial weights'
        },
        {
            id: 'init_06',
            category: 'Weight Init',
            name: 'All Zeros (Bad)',
            description: 'Zero initialization - symmetry problem.',
            config: { layers: [1, 8, 8, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine', init: 'zeros' },
            expectedBehavior: 'Neurons learn same thing'
        },
        {
            id: 'init_07',
            category: 'Weight Init',
            name: 'All Ones (Bad)',
            description: 'Large uniform initialization.',
            config: { layers: [1, 8, 8, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine', init: 'ones' },
            expectedBehavior: 'Saturation, poor learning'
        },
        {
            id: 'init_08',
            category: 'Weight Init',
            name: 'Xavier vs He Comparison',
            description: 'Compare init methods on ReLU network.',
            config: { layers: [1, 8, 8, 8, 1], activation: 'relu', optimizer: 'adam', lr: 0.01, targetFn: 'gaussian', init: 'xavier' },
            compareWith: { init: 'he' },
            expectedBehavior: 'He usually better for ReLU'
        },

        // ============================================
        // MULTI-OUTPUT (5 experiments)
        // ============================================
        {
            id: 'mo_01',
            category: 'Multi-Output',
            name: 'Sine + Cosine',
            description: 'Learn two related functions.',
            config: { layers: [1, 8, 8, 2], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: ['sine', 'cosine'] },
            expectedBehavior: 'Shared features help both'
        },
        {
            id: 'mo_02',
            category: 'Multi-Output',
            name: 'Opposite Functions',
            description: 'Learn function and its negative.',
            config: { layers: [1, 8, 8, 2], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: ['sine', 'inv_gaussian'] },
            expectedBehavior: 'Competing gradients'
        },
        {
            id: 'mo_03',
            category: 'Multi-Output',
            name: 'Multiple Polynomials',
            description: 'Linear, quadratic, cubic together.',
            config: { layers: [1, 16, 16, 3], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: ['linear', 'quadratic', 'cubic'] },
            expectedBehavior: 'Hierarchical polynomial learning'
        },
        {
            id: 'mo_04',
            category: 'Multi-Output',
            name: 'Gaussians Ensemble',
            description: 'Different Gaussians.',
            config: { layers: [1, 16, 16, 3], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: ['gaussian', 'gaussian_wide', 'gaussian_narrow'] },
            expectedBehavior: 'Similar patterns, different scales'
        },
        {
            id: 'mo_05',
            category: 'Multi-Output',
            name: 'Mixed Difficulty',
            description: 'Easy and hard functions together.',
            config: { layers: [1, 16, 16, 4], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: ['linear', 'sine', 'gabor', 'chirp'] },
            expectedBehavior: 'Easy functions train faster'
        },

        // ============================================
        // FUNCTION DIFFICULTY (10 experiments)
        // ============================================
        {
            id: 'fn_01',
            category: 'Function Difficulty',
            name: 'Easy: Linear',
            description: 'Simplest possible function.',
            config: { layers: [1, 4, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'linear' },
            expectedBehavior: 'Instant convergence'
        },
        {
            id: 'fn_02',
            category: 'Function Difficulty',
            name: 'Easy: Quadratic',
            description: 'Simple parabola.',
            config: { layers: [1, 4, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'quadratic' },
            expectedBehavior: 'Quick learning'
        },
        {
            id: 'fn_03',
            category: 'Function Difficulty',
            name: 'Medium: Sine',
            description: 'Single period sinusoid.',
            config: { layers: [1, 8, 8, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine' },
            expectedBehavior: 'Standard benchmark'
        },
        {
            id: 'fn_04',
            category: 'Function Difficulty',
            name: 'Medium: Gaussian',
            description: 'Bell curve shape.',
            config: { layers: [1, 8, 8, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'gaussian' },
            expectedBehavior: 'Localized feature'
        },
        {
            id: 'fn_05',
            category: 'Function Difficulty',
            name: 'Hard: Sine 4x',
            description: 'Higher frequency oscillation.',
            config: { layers: [1, 16, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'sine4x' },
            expectedBehavior: 'Needs more capacity'
        },
        {
            id: 'fn_06',
            category: 'Function Difficulty',
            name: 'Hard: Chirp',
            description: 'Increasing frequency sweep.',
            config: { layers: [1, 16, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'chirp' },
            expectedBehavior: 'Variable pattern difficulty'
        },
        {
            id: 'fn_07',
            category: 'Function Difficulty',
            name: 'Hard: Gabor',
            description: 'Localized oscillation.',
            config: { layers: [1, 16, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'gabor' },
            expectedBehavior: 'Complex local structure'
        },
        {
            id: 'fn_08',
            category: 'Function Difficulty',
            name: 'Very Hard: Step',
            description: 'Discontinuous function.',
            config: { layers: [1, 16, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'step' },
            expectedBehavior: 'Can only approximate'
        },
        {
            id: 'fn_09',
            category: 'Function Difficulty',
            name: 'Very Hard: Square Wave',
            description: 'Periodic discontinuities.',
            config: { layers: [1, 16, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'square_wave' },
            expectedBehavior: 'Gibbs phenomenon visible'
        },
        {
            id: 'fn_10',
            category: 'Function Difficulty',
            name: 'Very Hard: Triangle + Step',
            description: 'Multiple pattern types.',
            config: { layers: [1, 16, 16, 16, 1], activation: 'tanh', optimizer: 'adam', lr: 0.01, targetFn: 'trapezoid' },
            expectedBehavior: 'Complex approximation needed'
        }
    ],

    /**
     * Get all experiments
     */
    getAll() {
        return this.experiments;
    },

    /**
     * Get experiments by category
     */
    getByCategory(category) {
        return this.experiments.filter(e => e.category === category);
    },

    /**
     * Get experiment by ID
     */
    getById(id) {
        return this.experiments.find(e => e.id === id);
    },

    /**
     * Get all categories
     */
    getCategories() {
        const categories = [...new Set(this.experiments.map(e => e.category))];
        return categories;
    },

    /**
     * Get category counts
     */
    getCategoryCounts() {
        const counts = {};
        this.experiments.forEach(e => {
            counts[e.category] = (counts[e.category] || 0) + 1;
        });
        return counts;
    },

    /**
     * Search experiments by name or description
     */
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.experiments.filter(e =>
            e.name.toLowerCase().includes(lowerQuery) ||
            e.description.toLowerCase().includes(lowerQuery) ||
            e.category.toLowerCase().includes(lowerQuery)
        );
    }
};

// Export
window.ExperimentsLibrary = ExperimentsLibrary;
