import React, { useContext } from 'react';
import { NETWORK } from '../constants';
import { TezosPollsContext } from './context';


export function DefaultLink(props) {
    return (
        <a href={props.href} target='_blank' rel='noreferrer' className={props.className ? props.className : ''}>
            {props.children}
        </a>
    );
}

export function TzktLink(props) {
    return (
        <DefaultLink href={`https://${NETWORK}.tzkt.io/${props.address}`} className={props.className ? props.className : ''}>
            {props.children}
        </DefaultLink>
    );
}

export function TezosAddressLink(props) {
    // Get the required context information
    const { userAliases } = useContext(TezosPollsContext);

    // Get the user alias
    const alias = userAliases && userAliases[props.address];

    return (
        <TzktLink address={props.address} className={`tezos-address ${props.className ? props.className : ''}`}>
            {props.children}
            {props.useAlias && alias ?
                alias :
                props.shorten ? props.address.slice(0, 5) + '...' + props.address.slice(-5) : props.address
            }
        </TzktLink>
    );
}
