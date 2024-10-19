const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://uday11:uday11@cluster0.514zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => {
    console.log('MongoDB connected successfully!');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// Define the Rule schema
const ruleSchema = new mongoose.Schema({
    expression: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    modified_at: { type: Date, default: Date.now },
});

// Create a model
const Rule = mongoose.model('Rule', ruleSchema);

// Endpoint to create a new rule
app.post('/api/rules', async (req, res) => {
    try {
        const { expression } = req.body;

        if (!expression) {
            return res.status(400).json({ error: 'Rule expression is required' });
        }

        const rule = new Rule({ expression });
        await rule.save();

        res.status(201).json(rule);
    } catch (error) {
        console.error('Error saving rule:', error);
        res.status(500).json({ error: 'Failed to save the rule' });
    }
});

// Function to safely evaluate a rule expression
const evaluateRule = (userData, ruleString) => {
    const { age, department, salary, experience } = userData;

    // Check for various conditions
    if (ruleString.includes('age >')) {
        const ageCondition = parseInt(ruleString.split('age >')[1].split(' ')[0].trim());
        if (age <= ageCondition) return false;
    }
    if (ruleString.includes('department =')) {
        const deptCondition = ruleString.split('department =')[1].split("'")[1];
        if (department !== deptCondition) return false;
    }
    if (ruleString.includes('salary >')) {
        const salaryCondition = parseInt(ruleString.split('salary >')[1].split(' ')[0].trim());
        if (salary <= salaryCondition) return false;
    }
    if (ruleString.includes('experience >')) {
        const expCondition = parseInt(ruleString.split('experience >')[1].split(' ')[0].trim());
        if (experience <= expCondition) return false;
    }

    return true; // User meets all conditions
};



// Endpoint to evaluate rules
app.post('/api/evaluate', async (req, res) => {
    try {
        const { userData, ruleString } = req.body;

        if (!userData || !ruleString) {
            return res.status(400).json({ error: 'User data and rule string are required' });
        }

        const isEligible = evaluateRule(userData, ruleString);
        res.json({ eligible: isEligible });
    } catch (error) {
        console.error('Error evaluating rule:', error);
        res.status(500).json({ error: 'Failed to evaluate the rule' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
