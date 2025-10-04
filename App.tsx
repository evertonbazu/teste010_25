
import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import { User, Screen, GameResult } from './types';

const App: React.FC = () => {
    const [screen, setScreen] = useState<Screen>(Screen.LOGIN);
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [lastGameResult, setLastGameResult] = useState<GameResult | null>(null);

    useEffect(() => {
        try {
            const storedUser = sessionStorage.getItem('loggedInUser');
            if (storedUser) {
                const user: User = JSON.parse(storedUser);
                setLoggedInUser(user);
                setScreen(Screen.GAME);
            }
        } catch (error) {
            console.error("Failed to parse user from session storage:", error);
            sessionStorage.removeItem('loggedInUser');
        }
    }, []);

    const handleLoginSuccess = useCallback((user: User) => {
        const firstName = user.name.split(' ')[0];
        const userWithFirstName = { ...user, firstName };
        setLoggedInUser(userWithFirstName);
        sessionStorage.setItem('loggedInUser', JSON.stringify(userWithFirstName));
        setScreen(Screen.GAME);
    }, []);

    const handleGameEnd = useCallback((result: GameResult) => {
        setLastGameResult(result);
        setScreen(Screen.END);
    }, []);

    const handlePlayAgain = useCallback(() => {
        setLastGameResult(null);
        setScreen(Screen.GAME);
    }, []);
    
    const handleBackToLogin = useCallback(() => {
        setLastGameResult(null);
        setLoggedInUser(null);
        sessionStorage.removeItem('loggedInUser');
        setScreen(Screen.LOGIN);
    }, []);

    const renderScreen = () => {
        switch (screen) {
            case Screen.GAME:
                if (loggedInUser) {
                    return <GameScreen user={loggedInUser} onGameEnd={handleGameEnd} />;
                }
                // Fallback to login if user is not available
                setScreen(Screen.LOGIN);
                return <LoginScreen onLoginSuccess={handleLoginSuccess} onShowRanking={() => setScreen(Screen.END)} />;
            case Screen.END:
                return <EndScreen 
                            user={loggedInUser} 
                            gameResult={lastGameResult} 
                            onPlayAgain={handlePlayAgain}
                            onBackToLogin={handleBackToLogin}
                        />;
            case Screen.LOGIN:
            default:
                return <LoginScreen onLoginSuccess={handleLoginSuccess} onShowRanking={() => setScreen(Screen.END)} />;
        }
    };

    return <div className="min-h-screen w-full flex items-center justify-center p-4">{renderScreen()}</div>;
};

export default App;
