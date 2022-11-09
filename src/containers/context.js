import React, { createContext } from 'react';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { NETWORK, CONTRACT_ADDRESS, RPC_NODE } from '../constants';
import { InformationMessage, ConfirmationMessage, ErrorMessage } from './messages';
import * as utils from './utils';


// Initialize the tezos toolkit
const tezos = new TezosToolkit(RPC_NODE);

// Initialize the wallet
const wallet = new BeaconWallet({
    name: 'Tezos polls',
    preferredNetwork: NETWORK
});

// Pass the wallet to the tezos toolkit
tezos.setWalletProvider(wallet);

// Create the tezos polls context
export const TezosPollsContext = createContext();

// Create the tezos polls context provider component
export class TezosPollsContextProvider extends React.Component {

    constructor(props) {
        // Pass the properties to the base class
        super(props);

        // Define the component state parameters
        this.state = {
            // The user address
            userAddress: undefined,

            // The tezos polls contract address
            contractAddress: CONTRACT_ADDRESS,

            // The tezos polls contract storage
            storage: undefined,

            // The polls
            polls: undefined,

            // The user votes
            userVotes: undefined,

            // The polls current results
            results: undefined,

            // The user aliases
            userAliases: undefined,

            // The tezos polls contract reference
            contract: undefined,

            // The information message
            informationMessage: undefined,

            // The confirmation message
            confirmationMessage: undefined,

            // The error message
            errorMessage: undefined,

            // Sets the information message
            setInformationMessage: (message) => this.setState({
                informationMessage: message
            }),

            // Sets the confirmation message
            setConfirmationMessage: (message) => this.setState({
                confirmationMessage: message
            }),

            // Sets the error message
            setErrorMessage: (message) => this.setState({
                errorMessage: message
            }),

            // Returns the tezos polls contract reference
            getContract: async () => {
                if (this.state.contract) {
                    return this.state.contract;
                }

                console.log('Accessing the tezos polls contract...');
                const contract = await utils.getContract(tezos, this.state.contractAddress);
                this.setState({ contract: contract });

                return contract;
            },

            // Connects the user wallet
            connectWallet: async () => {
                console.log('Connecting the user wallet...');
                await wallet.requestPermissions({ network: { type: NETWORK, rpcUrl: RPC_NODE } })
                    .catch(error => console.log('Error while requesting wallet permissions:', error));

                console.log('Accessing the user address...');
                const userAddress = await utils.getUserAddress(wallet);
                this.setState({ userAddress: userAddress });

                if (this.state.storage && userAddress) {
                    console.log('Downloading the user votes...');
                    const userVotes = await utils.getUserVotes(userAddress, this.state.storage.votes);
                    this.setState({ userVotes: userVotes });
                }
            },

            // Disconnects the user wallet
            disconnectWallet: async () => {
                // Clear the active account
                console.log('Disconnecting the user wallet...');
                await wallet.clearActiveAccount();

                // Reset the user related state parameters
                this.setState({
                    userAddress: undefined,
                    userVotes: undefined,
                    contract: undefined
                });
            },

            // Waits for an operation to be confirmed
            confirmOperation: async (operation) => {
                // Return if the operation is undefined
                if (operation === undefined) return;

                // Display the information message
                this.state.setInformationMessage('Waiting for the operation to be confirmed...');

                // Wait for the operation to be confirmed
                console.log('Waiting for the operation to be confirmed...');
                await operation.confirmation(1)
                    .then(() => console.log(`Operation confirmed: https://${NETWORK}.tzkt.io/${operation.opHash}`))
                    .catch(error => console.log('Error while confirming the operation:', error));

                // Remove the information message
                this.state.setInformationMessage(undefined);
            },

            // Creates a poll
            createPoll: async (question, options, votingPeriod) => {
                // Check that the question is not undefined
                if (!question || question === '') {
                    this.state.setErrorMessage('The poll question is not defined');
                    return;
                }

                // Clean the options from duplicates and create the options dictionary
                const cleanOptions = new Set(options);
                const optionsDictionary = {};
                let counter = 0;

                for (const option of cleanOptions) {
                    if (option !== '') {
                        optionsDictionary[counter] = utils.stringToHex(option);
                        counter += 1;
                    }
                }

                // Check that there are at least two options to vote
                if (counter < 2) {
                    this.state.setErrorMessage(
                        'The poll should have at least two different options to vote');
                    return;
                }

                // Get tezos polls contract reference
                const contract = await this.state.getContract();

                // Return if the contract reference is not available
                if (!contract) return;

                // Send the create poll operation
                console.log('Sending the create poll operation...');
                const operation = await contract.methods.create_poll(
                    utils.stringToHex(question),
                    MichelsonMap.fromLiteral(optionsDictionary),
                    votingPeriod).send()
                    .catch(error => console.log('Error while sending the create poll operation:', error));

                // Wait for the confirmation
                await this.state.confirmOperation(operation);

                // Update the polls and the user aliases
                const polls = await utils.getBigmapKeys(this.state.storage.polls);
                const userAliases = await utils.getUserAliases(polls);
                this.setState({
                    polls: polls,
                    userAliases: userAliases
                });
            },

            // Votes in a poll
            vote: async (pollId, option) => {
                // Get the tezos polls contract reference
                const contract = await this.state.getContract();

                // Return if the contract reference is not available
                if (!contract) return;

                // Send the vote operation
                console.log('Sending the vote operation...');
                const operation = await contract.methods.vote(pollId, option).send()
                    .catch(error => console.log('Error while sending the vote operation:', error));

                // Wait for the confirmation
                await this.state.confirmOperation(operation);

                // Update the user votes and the poll results
                const storage = this.state.storage;
                const userVotes = await utils.getUserVotes(this.state.userAddress, storage.votes);
                const results = await utils.getResults(storage.results);
                this.setState({
                    userVotes: userVotes,
                    results: results
                });
            }
        };

        // Loads all the needed information at once
        this.loadInformation = async () => {
            // Initialize the new state dictionary
            const newState = {}

            console.log('Accessing the user address...');
            const userAddress = await utils.getUserAddress(wallet);
            newState.userAddress = userAddress;

            console.log('Downloading the tezos polls contract storage...');
            const storage = await utils.getContractStorage(this.state.contractAddress);
            newState.storage = storage;

            if (storage) {
                console.log('Downloading the polls...');
                const polls = await utils.getBigmapKeys(storage.polls);
                newState.polls = polls;

                if (userAddress) {
                    console.log('Downloading the user votes...');
                    const userVotes = await utils.getUserVotes(userAddress, storage.votes);
                    newState.userVotes = userVotes;
                }

                console.log('Downloading the results...');
                const results = await utils.getResults(storage.results);
                newState.results = results;

                if (polls) {
                    console.log('Downloading the user aliases...');
                    const userAliases = await utils.getUserAliases(polls);
                    newState.userAliases = userAliases;
                }
            }

            // Update the component state
            this.setState(newState);
        };
    }

    componentDidMount() {
        // Load all the relevant information
        this.loadInformation();
    }

    render() {
        return (
            <TezosPollsContext.Provider value={this.state}>
                {this.state.informationMessage &&
                    <InformationMessage message={this.state.informationMessage} />
                }

                {this.state.confirmationMessage &&
                    <ConfirmationMessage message={this.state.confirmationMessage} onClick={() => this.state.setConfirmationMessage(undefined)} />
                }

                {this.state.errorMessage &&
                    <ErrorMessage message={this.state.errorMessage} onClick={() => this.state.setErrorMessage(undefined)} />
                }

                {this.props.children}
            </TezosPollsContext.Provider>
        );
    }
}
