import React, { useContext } from 'react';
import { TezosPollsContext } from './context';
import { Button } from './button';
import { TezosAddressLink } from './links';
import { hexToString } from './utils';


export function Polls() {
    // Get the required context information
    const { polls } = useContext(TezosPollsContext);

    // Separate the polls between finished and active polls
    const finishedPolls = [];
    const activePolls = [];

    if (polls) {
        // Loop over the complete list of polls
        const now = new Date();

        for (const poll of polls) {
            // Check if the poll voting period has finished
            const votingPeriod = parseInt(poll.value.voting_period);
            const votingEndDate = new Date(poll.value.timestamp);
            votingEndDate.setDate(votingEndDate.getDate() + votingPeriod);

            if (now > votingEndDate) {
                finishedPolls.push(poll);
            } else {
                activePolls.push(poll);
            }
        }
    }

    return (
        <>
            <section>
                <h2>Active polls</h2>
                <PollList polls={activePolls} active />
            </section>

            <section>
                <h2>Finished polls</h2>
                <PollList polls={finishedPolls} />
            </section>
        </>
    );
}

function PollList(props) {
    return (
        <ul className='poll-list'>
            {props.polls.map(poll =>
                <Poll key={poll.key}
                    pollId={poll.key}
                    poll={poll.value}
                    active={props.active}
                />
            )}
        </ul>
    );
}

function Poll(props) {
    // Get the required context information
    const { results } = useContext(TezosPollsContext);

    // Get the voting start and end dates
    const poll = props.poll;
    const votingStartDate = new Date(poll.timestamp);
    const votingEndDate = new Date(poll.timestamp);
    votingEndDate.setDate(votingEndDate.getDate() + parseInt(poll.voting_period));

    // Get the maximum number of votes that an option received
    let maxOptionVotes = 0;
    const pollResults = results && results[props.pollId];

    for (const option in pollResults) {
        maxOptionVotes = Math.max(maxOptionVotes, pollResults[option]);
    }

    return (
        <li className='poll'>
            <h3 className='poll-question'>{hexToString(poll.question)}</h3>

            <ul className='poll-description'>
                <li>Poll #{props.pollId}</li>
                <li>Created by <TezosAddressLink address={poll.issuer} useAlias shorten /></li>
                <li>Voting started: {votingStartDate.toISOString()}</li>
                <li>Voting end{props.active ? 's' : 'ed'}: {votingEndDate.toISOString()}</li>
                <li>Options:
                    <ul className='poll-options'>
                        {Object.keys(poll.options).map(key =>
                            <PollOption key={key}
                                pollId={props.pollId}
                                optionKey={key}
                                optionValue={poll.options[key]}
                                active={props.active}
                                maxOptionVotes={maxOptionVotes}
                            />
                        )}
                    </ul>
                </li>
            </ul>
        </li>
    );
}

function PollOption(props) {
    // Get the required context information
    const { userAddress, userVotes, results, vote } = useContext(TezosPollsContext);

    // Get the number of votes that received this option
    const pollResults = results && results[props.pollId];
    const optionVotes = pollResults ? (pollResults[props.optionKey] ? pollResults[props.optionKey] : 0) : 0;

    // Get if this is the option that the user has voted
    const userVotedOption = userVotes && userVotes[props.pollId] === props.optionKey;

    return (
        <li className={'poll-option' + (((optionVotes === props.maxOptionVotes) && !props.active) ? ' winning-option' : '')}>
            <Button
                text={hexToString(props.optionValue)}
                className={userVotedOption ? 'user-vote' : ''}
                onClick={() => props.active && userAddress && vote(props.pollId, props.optionKey)}
            />
            <p className='poll-option-votes'>{optionVotes} vote{(optionVotes === 1) ? '' : 's'}</p>
        </li>
    );
}
