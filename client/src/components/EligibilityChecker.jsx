import React, { useState } from 'react';
import axios from 'axios';
import './style.css'; 

const EligibilityChecker = () => {
    const [age, setAge] = useState('');
    const [department, setDepartment] = useState('');
    const [salary, setSalary] = useState('');
    const [experience, setExperience] = useState('');
    const [ruleString, setRuleString] = useState('');
    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const saveRule = async () => {
        try {
            // Save the rule to the database
            const response = await axios.post('http://localhost:5000/api/rules', { expression: ruleString });
            console.log('Rule saved successfully:', response.data);
        } catch (error) {
            console.error('Error saving rule:', error);
            setErrorMessage('Failed to save the rule.');
        }
    };

    const checkEligibility = async () => {
        try {
            // Validate inputs
            if (!age || !department || !salary || !experience || !ruleString) {
                setErrorMessage('Please fill out all fields');
                return;
            }

            const userData = {
                age: parseInt(age),
                department,
                salary: parseInt(salary),
                experience: parseInt(experience),
            };

            // Save the rule to the database before checking eligibility
            await saveRule();

            // Check eligibility with the rule and user data
            const response = await axios.post('http://localhost:5000/api/evaluate', { userData, ruleString });
            setResult(response.data.eligible);
            setErrorMessage(''); // Clear any previous errors
        } catch (error) {
            console.error('Error evaluating rule:', error);
            setErrorMessage('Failed to evaluate the rule. Please try again.');
        }
    };

    return (
        <div className="container">
            <h1>Eligibility Check</h1>

            <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
            />
            <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
            />
            <input
                type="number"
                placeholder="Salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
            />
            <input
                type="number"
                placeholder="Experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
            />
            <textarea
                placeholder="Rule String (e.g., (age > 30 AND department = 'Sales') OR ...)"
                value={ruleString}
                onChange={(e) => setRuleString(e.target.value)}
                rows="4"
            />
            <button onClick={checkEligibility}>Check Eligibility</button>

            {errorMessage && (
                <p className="error-message">{errorMessage}</p>
            )}

            {result !== null && (
                <div className="result">
                    {result ? (
                        <div className="result-item">
                            <svg className="icon tick" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                                <circle cx="12" cy="12" r="10" fill="#4caf50" />
                                <path d="M10 15l5-5-1.41-1.41L10 12.17l-2.59-2.59L6 10l4 5z" fill="white" />
                            </svg>
                            <h2 className="status">Eligible</h2>
                        </div>
                    ) : (
                        <div className="result-item">
                            <svg className="icon cross" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                                <circle cx="12" cy="12" r="10" fill="#f44336" />
                                <path d="M15.54 8.46L12 12l3.54 3.54L15 17l-3-3-3 3-1.54-1.54L10.46 12 7 8.46 8.46 7l3 3 3-3z" fill="white" />
                            </svg>
                            <h2 className="status">Not Eligible</h2>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EligibilityChecker;
