import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { TezosPollsContext } from './context';
import { TezosAddressLink } from './links';
import { Button } from './button';


export function Header() {
    return (
        <header className='header-container'>
            <Navigation />
            <Wallet />
        </header>
    );
}

export function Navigation() {
    return (
        <nav>
            <ul>
                <li>
                    <NavLink to='/'>Polls</NavLink>
                </li>
                <li>
                    <NavLink to='/create'>Create poll</NavLink>
                </li>
            </ul>
        </nav>
    );
}

export function Wallet() {
    // Get the required context information
    const { userAddress, connectWallet, disconnectWallet } = useContext(TezosPollsContext);

    return (
        <div className='sync-container'>
            {userAddress &&
                <TezosAddressLink address={userAddress} shorten />
            }
            {userAddress ?
                <Button text='unsync' onClick={() => disconnectWallet()} /> :
                <Button text='sync' onClick={() => connectWallet()} />
            }
        </div>
    );
}
