import React, { useState, useEffect, useCallback } from 'react';
import { User, RankingEntry, GameResult } from '../types';
import { getRanking, saveScoreAndGetRanking } from '../services/apiService';
import Loader from './Loader';
import { audioService } from '../services/audioService';

interface EndScreenProps {
    user: User | null;
    gameResult: GameResult | null;
    onPlayAgain: () => void;
    onBackToLogin: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ user, gameResult, onPlayAgain, onBackToLogin }) => {
    const [ranking, setRanking] = useState<RankingEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAndSaveRanking = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        let result;
        if (gameResult && user) {
            result = await saveScoreAndGetRanking(user.name, user.turma, gameResult.score, gameResult.timeSpent, user.code);
        } else {
            result = await getRanking();
        }

        if (result.status === 'success' && result.ranking) {
            setRanking(result.ranking);
        } else {
            setError(result.message || 'Não foi possível carregar o ranking.');
            setRanking([]);
        }
        setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameResult, user]);

    useEffect(() => {
        fetchAndSaveRanking();
        if (gameResult) {
            audioService.playSound('complete');
        }
    }, [fetchAndSaveRanking, gameResult]);

    const getMotivationalMessage = () => {
        if (!gameResult || !user) return "Ranking";
        const percentage = (gameResult.score / gameResult.totalQuestions) * 100;
        if (percentage >= 80) return `Excelente, ${user.firstName}! Você domina o assunto! 🏆`;
        if (percentage >= 50) return `Muito bem, ${user.firstName}! Continue praticando. 👍`;
        return `Não desista, ${user.firstName}! Cada tentativa é um aprendizado. ✨`;
    };

    const grade = gameResult ? ((gameResult.score / gameResult.totalQuestions) * 10).toFixed(1).replace('.', ',') : 'N/A';
    
    return (
        <div className="bg-white/70 p-6 sm:p-8 rounded-2xl shadow-xl max-w-3xl w-full text-center my-8 flex flex-col">
            {gameResult && user && (
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-sky-800">Fim de Jogo!</h1>
                    <p className="text-lg text-sky-800 mt-4 font-semibold">{getMotivationalMessage()}</p>
                    <div className="my-6 text-sky-700">
                        <div className="text-xl"><strong>Pontuação Final:</strong> {gameResult.score}/{gameResult.totalQuestions}</div>
                        <div className="text-2xl font-bold mt-2">SUA NOTA FINAL É: <span className="text-blue-600">{grade}</span></div>
                    </div>
                </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-sky-800 mt-6 mb-4">Ranking (Top 100)</h2>
            <div className="overflow-y-auto h-64 bg-white/50 rounded-lg border border-sky-200">
                <table className="w-full text-left">
                    <thead className="bg-sky-200 sticky top-0">
                        <tr>
                            <th className="p-2">#</th>
                            <th className="p-2">Nome</th>
                            <th className="p-2">Pontos</th>
                            <th className="p-2">Turma</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center"><div className="mx-auto"><Loader className="w-6 h-6 border-sky-600 border-t-transparent"/></div></td></tr>
                        ) : error ? (
                            <tr><td colSpan={4} className="p-4 text-center text-red-500">{error}</td></tr>
                        ) : ranking.length === 0 ? (
                            <tr><td colSpan={4} className="p-4 text-center">Ainda não há pontuações.</td></tr>
                        ) : (
                            ranking.map((entry, index) => (
                                <tr key={entry.code + index} className={`border-b border-sky-100 ${user?.code === entry.code ? 'bg-yellow-200' : ''}`}>
                                    <td className="p-2 font-bold">{index + 1}</td>
                                    <td className="p-2">{entry.name}</td>
                                    <td className="p-2">{entry.score}</td>
                                    <td className="p-2">{entry.turma}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
             {user ? (
                <button onClick={onPlayAgain} className="mt-8 w-full bg-yellow-500 text-white text-2xl sm:text-3xl font-bold py-3 rounded-xl shadow-lg hover:bg-yellow-600 transition">
                    Jogar Novamente
                </button>
             ) : (
                <button onClick={onBackToLogin} className="mt-8 w-full bg-gray-500 text-white text-2xl sm:text-3xl font-bold py-3 rounded-xl shadow-lg hover:bg-gray-600 transition">
                    Voltar
                </button>
             )}
        </div>
    );
};

export default EndScreen;