import React from 'react';
import { Outlet } from 'react-router-dom';
import { TezosPollsContextProvider } from './containers/context';
import { Header } from './containers/header';
import { Footer } from './containers/footer';
import { Polls } from './containers/polls';
import { CreatePollForm } from './containers/forms';


export function App() {
    return (
        <TezosPollsContextProvider>
            <div className='app-container'>
                <Header />
                <Outlet />
                <Footer />
            </div>
        </TezosPollsContextProvider>
    );
}

export function AllPolls() {
    return (
        <main>
            <h1>Tezos polls</h1>
            <Polls />
        </main>
    );
}

export function CreatePoll() {
    return (
        <main>
            <h1>Create a new poll</h1>
            <CreatePollForm />
        </main>
    );
}

export function NotFound() {
    return (
        <main>
            <p>Page not found...</p>
        </main>
    );
}
