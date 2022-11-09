import React, { useContext, useState } from 'react';
import { TezosPollsContext } from './context';
import { Button } from './button';


export function CreatePollForm() {
    // Get the tezos polls context
    const context = useContext(TezosPollsContext);

    // Return if the user is not connected
    if (!context.userAddress) {
        return (
            <section>
                <p>You need to sync your wallet to be able to create a poll.</p>
            </section>
        );
    }

    return (
        <section>
            <PollForm handleSubmit={context.createPoll} />
        </section>
    );
}

function PollForm(props) {
    // Set the component state
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["yes", "no", "abstain"]);
    const [votingPeriod, setVotingPeriod] = useState(1);

    // Define the on change handler
    const handleChange = (index, value) => {
        // Create a new options array
        const newOptions = options.map((option, i) => (i === index) ? value : option);

        // Update the component state
        setOptions(newOptions);
    };

    // Define the on click handler
    const handleClick = (e, increase) => {
        e.preventDefault();

        // Create a new options array
        const newOptions = options.slice();

        // Add or remove an option from the list
        if (increase) {
            newOptions.push("");
        } else if (newOptions.length > 2) {
            delete newOptions.pop();
        }

        // Update the component state
        setOptions(newOptions);
    };

    // Define the on submit handler
    const handleSubmit = e => {
        e.preventDefault();
        props.handleSubmit(question, options, votingPeriod);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className='form-input'>
                <label>The question you want to ask:
                    {' '}
                    <input
                        type='text'
                        spellCheck='false'
                        minLength='1'
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                    />
                </label>
                <br />
                <label className='options-input'>The options to vote:
                    <div className='options-input-container'>
                        {options.map((option, index) => (
                            <label key={index} className='option-input'>
                                <input 
                                    type='text'
                                    spellCheck='false'
                                    minLength='1'
                                    value={option}
                                    onChange={e => handleChange(index, e.target.value)}
                                />
                            </label>
                        ))}
                    </div>
                    <Button text='+' onClick={e => handleClick(e, true)} />
                    {' '}
                    <Button text='-' onClick={e => handleClick(e, false)} />
                </label>
                <br />
                <label>The poll duration in days:
                    {' '}
                    <input
                        type='number'
                        min='1'
                        max='5'
                        step='1'
                        value={votingPeriod}
                        onChange={e => setVotingPeriod(Math.round(e.target.value))}
                    />
                </label>
            </div>
            <input type='submit' value='create poll' />
        </form>
    );
}
