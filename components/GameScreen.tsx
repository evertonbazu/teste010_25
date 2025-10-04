import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Question, GameResult } from '../types';
import { questions } from '../constants';
import VolumeIcon from './icons/VolumeIcon';
import SoundOffIcon from './icons/SoundOffIcon';
import { getFeedbackForAnswer, getHintForQuestion } from '../services/geminiService';
import Loader from './Loader';
import { audioService } from '../services/audioService';

interface GameScreenProps {
    user: User;
    onGameEnd: (result: GameResult) => void;
}

const FeedbackModal: React.FC<{
    message: string;
    explanation: string;
    isCorrect: boolean;
    isLoading?: boolean;
    onContinue: () => void;
}> = ({ message, explanation, isCorrect, isLoading = false, onContinue }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-6 sm:p-8 rounded-2xl text-white font-bold shadow-2xl w-11/12 max-w-sm text-center ${isLoading ? 'bg-blue-500' : isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                <strong className="block text-3xl">{message}</strong>
                <div className="text-xl mt-2 block min-h-[5rem] flex items-center justify-center">
                    {isLoading ? <Loader className="mx-auto" /> : <span>{explanation}</span>}
                </div>
                {!isLoading && (
                    <button onClick={onContinue} className="mt-4 bg-white text-sky-800 text-xl font-bold py-2 px-8 rounded-xl shadow-md hover:bg-gray-200 transition">
                        Continuar
                    </button>
                )}
            </div>
        </div>
    );
};

const HintModal: React.FC<{
    message: string;
    isLoading: boolean;
    onClose: () => void;
}> = ({ message, isLoading, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="p-6 sm:p-8 rounded-2xl text-white font-bold shadow-2xl w-11/12 max-w-sm text-center bg-purple-500">
                <strong className="block text-3xl">Dica!</strong>
                <div className="text-xl mt-2 block min-h-[5rem] flex items-center justify-center">
                    {isLoading ? <Loader className="mx-auto" /> : <span>{message}</span>}
                </div>
                {!isLoading && (
                    <button onClick={onClose} className="mt-4 bg-white text-purple-800 text-xl font-bold py-2 px-8 rounded-xl shadow-md hover:bg-gray-200 transition">
                        Entendi!
                    </button>
                )}
            </div>
        </div>
    );
};


const GameScreen: React.FC<GameScreenProps> = ({ user, onGameEnd }) => {
    const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [bonusCards, setBonusCards] = useState(5);
    const [skipCards, setSkipCards] = useState(2);
    const [hintCards, setHintCards] = useState(2);
    const [fontSize, setFontSize] = useState(16);
    const [isUppercase, setIsUppercase] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; explanation: string; isCorrect: boolean; isLoading?: boolean; } | null>(null);
    const [hint, setHint] = useState<{ message: string; isLoading: boolean } | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isMuted, setIsMuted] = useState(audioService.isMuted);
    
    const startTimeRef = useRef<Date | null>(null);

    const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }, []);

    const startGame = useCallback(() => {
        const mcqQuestions = questions.filter(q => !q.type);
        const inputQuestions = questions.filter(q => q.type === 'input');

        const shuffledMcq = shuffleArray(mcqQuestions);
        const shuffledInput = shuffleArray(inputQuestions);

        const totalQuestionsInGame = 12;

        // The ideal mix is ~75% multiple choice, 25% input.
        const idealNumMcq = totalQuestionsInGame - Math.floor(totalQuestionsInGame * 0.25);

        // But we are limited by the number of available questions.
        // Take as many MCQs as available, up to the ideal number.
        const numMcqQuestions = Math.min(mcqQuestions.length, idealNumMcq);

        // Fill the rest of the game with input questions to ensure a total of 12.
        const numInputQuestions = totalQuestionsInGame - numMcqQuestions;

        const selectedMcq = shuffledMcq.slice(0, numMcqQuestions);
        const selectedInput = shuffledInput.slice(0, numInputQuestions);
        
        setShuffledQuestions(shuffleArray([...selectedMcq, ...selectedInput]));
        setCurrentQuestionIndex(0);
        setScore(0);
        setBonusCards(5);
        setSkipCards(2);
        setHintCards(2);
        setIsAnswered(false);
        setHiddenOptions([]);
        setFeedback(null);
        setHint(null);
        setInputValue('');
        startTimeRef.current = new Date();
    }, [shuffleArray]);

    useEffect(() => {
        startGame();
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentQuestion = useMemo(() => shuffledQuestions[currentQuestionIndex], [shuffledQuestions, currentQuestionIndex]);
    const shuffledOptions = useMemo(() => {
        if (currentQuestion?.options) {
            return shuffleArray(currentQuestion.options);
        }
        return [];
    }, [currentQuestion, shuffleArray]);

    const handleNext = () => {
        setIsAnswered(false);
        setHiddenOptions([]);
        setFeedback(null);
        setHint(null);
        setInputValue('');
        if (currentQuestionIndex + 1 >= shuffledQuestions.length) {
            const endTime = new Date();
            const timeSpent = Math.round(((endTime.getTime() - (startTimeRef.current?.getTime() ?? 0))) / 1000);
            onGameEnd({ score, totalQuestions: shuffledQuestions.length, timeSpent });
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleAnswer = async (userAnswer: string) => {
        if (isAnswered) return;
        setIsAnswered(true);

        if (currentQuestion.type === 'input') {
            setFeedback({ 
                message: "Analisando...", 
                explanation: "", 
                isCorrect: true, // Placeholder for styling
                isLoading: true 
            });

            const aiResult = await getFeedbackForAnswer(currentQuestion.question, currentQuestion.answer, userAnswer);
            
            if (aiResult.status === 'success') {
                if (aiResult.data.isCorrect) {
                    audioService.playSound('correct');
                    setScore(prev => prev + 1);
                    setFeedback({ 
                        message: "Correto! +1 Ponto! 🎉", 
                        explanation: aiResult.data.feedback, 
                        isCorrect: true 
                    });
                } else {
                    audioService.playSound('incorrect');
                    setFeedback({ 
                        message: "Ops! Resposta errada.", 
                        explanation: aiResult.data.feedback, 
                        isCorrect: false 
                    });
                }
            } else {
                // Fallback to simple check if AI fails
                console.error("AI feedback failed, falling back to simple check.");
                const isCorrect = userAnswer.trim().replace(',', '.').toLowerCase() === String(currentQuestion.answer).trim().replace(',', '.').toLowerCase();
                const explanation = `A resposta correta é "${currentQuestion.answer}".`;
                
                if (isCorrect) {
                    audioService.playSound('correct');
                    setScore(prev => prev + 1);
                    setFeedback({ message: "Correto! +1 Ponto! 🎉", explanation, isCorrect: true });
                } else {
                    audioService.playSound('incorrect');
                    setFeedback({ message: "Ops! Resposta errada.", explanation, isCorrect: false });
                }
            }
        } else {
            const isCorrect = userAnswer.trim().toLowerCase() === String(currentQuestion.answer).trim().toLowerCase();
            let explanation = '';

            if (currentQuestion.feedbacks) {
                explanation = currentQuestion.feedbacks[userAnswer] || `A resposta correta é "${currentQuestion.answer}".`;
            } else {
                explanation = `A resposta correta é "${currentQuestion.answer}".`;
            }
            
            if (isCorrect) {
                audioService.playSound('correct');
                setScore(prev => prev + 1);
                setFeedback({ message: "Correto! +1 Ponto! 🎉", explanation, isCorrect: true });
            } else {
                audioService.playSound('incorrect');
                setFeedback({ message: "Ops! Resposta errada.", explanation, isCorrect: false });
            }
        }
    };

    const useBonusCard = () => {
        if (bonusCards > 0 && !isAnswered && currentQuestion.options) {
            audioService.playSound('powerup');
            setBonusCards(prev => prev - 1);
            const wrongOptions = shuffledOptions.filter(opt => opt.toLowerCase() !== currentQuestion.answer.toLowerCase());
            const optionsToHide = shuffleArray(wrongOptions).slice(0, 2);
            setHiddenOptions(optionsToHide);
        }
    };
    
    const useSkipCard = () => {
        if (skipCards > 0 && !isAnswered) {
            audioService.playSound('skip');
            setSkipCards(prev => prev - 1);
            handleNext();
        }
    };

    const useHintCard = async () => {
        if (hintCards > 0 && !isAnswered) {
            audioService.playSound('hint');
            setHintCards(prev => prev - 1);
            setHint({ message: '', isLoading: true });

            const result = await getHintForQuestion(currentQuestion.question);
            
            if (result.status === 'success') {
                setHint({ message: result.hint, isLoading: false });
            } else {
                setHint({ message: result.message, isLoading: false });
                // Give the card back if the API fails
                setHintCards(prev => prev + 1);
            }
        }
    };

    const handleToggleMute = useCallback(() => {
        setIsMuted(audioService.toggleMute());
    }, []);

    const readAloud = () => {
        if ('speechSynthesis' in window && currentQuestion) {
            window.speechSynthesis.cancel();
            const questionText = currentQuestion.question;
            const optionsText = currentQuestion.options ? currentQuestion.options.map((opt, i) => `Alternativa ${i + 1}: ${opt}`).join('. ') : '';
            const utterance = new SpeechSynthesisUtterance(`${questionText}. ${optionsText}`);
            utterance.lang = 'pt-BR';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Seu navegador não suporta a leitura em voz alta.');
        }
    };
    
    if (!currentQuestion) {
        return <div className="text-white text-2xl">Carregando jogo...</div>;
    }
    
    const baseFontSize = `${fontSize}px`;
    const questionFontSize = `${fontSize * 1.2}px`;
    const textTransformClass = isUppercase ? 'uppercase' : 'normal-case';

    return (
        <div className="flex flex-col items-center justify-center w-full">
            {feedback && <FeedbackModal {...feedback} onContinue={handleNext} />}
            {hint && <HintModal {...hint} onClose={() => setHint(null)} />}
            <header className="text-center mb-4 sm:mb-8 w-full max-w-4xl relative">
                <div className="absolute top-0 left-0 flex items-center gap-2">
                    <button onClick={() => setFontSize(s => Math.max(12, s - 2))} title="Diminuir Fonte" className="bg-white/50 rounded-full p-2 w-10 h-10 flex items-center justify-center text-sky-800 font-bold text-xl shadow-md hover:bg-white/75">-A</button>
                    <button onClick={() => setFontSize(s => Math.min(28, s + 2))} title="Aumentar Fonte" className="bg-white/50 rounded-full p-2 w-10 h-10 flex items-center justify-center text-sky-800 font-bold text-xl shadow-md hover:bg-white/75">+A</button>
                    <button onClick={() => setIsUppercase(u => !u)} title="Alternar Maiúsculas" className="bg-white/50 rounded-full p-2 w-10 h-10 flex items-center justify-center text-sky-800 font-bold text-xl shadow-md hover:bg-white/75">Aa</button>
                    <button onClick={readAloud} title="Ler Questão em Voz Alta" className="bg-white/50 rounded-full p-2 w-10 h-10 flex items-center justify-center text-sky-800 font-bold text-xl shadow-md hover:bg-white/75">
                        <VolumeIcon />
                    </button>
                    <button onClick={handleToggleMute} title={isMuted ? "Ativar Som" : "Desativar Som"} className="bg-white/50 rounded-full p-2 w-10 h-10 flex items-center justify-center text-sky-800 font-bold text-xl shadow-md hover:bg-white/75">
                        {isMuted ? <SoundOffIcon /> : <VolumeIcon />}
                    </button>
                </div>
                 <div className="flex justify-end items-center w-full">
                    <div className="bg-white/50 rounded-full px-4 sm:px-6 py-2">
                        <span className="text-xl sm:text-2xl font-semibold text-sky-800">Pontos: {score}/{shuffledQuestions.length}</span>
                    </div>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.2)'}}>MAT - CAP12</h1>
                <p className="text-lg sm:text-xl text-white mt-2">Olá, {user.firstName}! Escolha a resposta certa ou digite o valor correto.</p>
                <div className="flex flex-col items-center justify-center gap-2 mt-4">
                     <div className="flex items-center justify-center gap-2">
                        <button onClick={useBonusCard} disabled={bonusCards <= 0 || isAnswered || currentQuestion.type === 'input'} title="Eliminar 2 erradas (50/50)" className="bg-yellow-400 rounded-lg px-4 py-2 flex items-center justify-center text-sky-900 font-bold text-base shadow-md hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed">
                            Usar Carta 50/50
                        </button>
                        <span className="text-white text-2xl font-bold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>x{bonusCards}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                         <button onClick={useSkipCard} disabled={skipCards <= 0 || isAnswered} title="Pular questão" className="bg-blue-300 rounded-lg px-4 py-2 flex items-center justify-center text-sky-900 font-bold text-base shadow-md hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed">
                             Pular Questão
                         </button>
                         <span className="text-white text-2xl font-bold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>x{skipCards}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                         <button onClick={useHintCard} disabled={hintCards <= 0 || isAnswered} title="Pedir uma dica" className="bg-purple-400 rounded-lg px-4 py-2 flex items-center justify-center text-white font-bold text-base shadow-md hover:bg-purple-300 transition disabled:opacity-50 disabled:cursor-not-allowed">
                             Pedir Dica
                         </button>
                         <span className="text-white text-2xl font-bold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>x{hintCards}</span>
                    </div>
                </div>
            </header>
            <main className="w-full bg-white/70 p-6 sm:p-8 rounded-2xl shadow-xl text-center max-w-4xl">
                 <div style={{fontSize: questionFontSize}} className={`mb-6 sm:mb-8 font-semibold text-sky-800 min-h-[6rem] flex items-center justify-center ${textTransformClass}`}>
                    {currentQuestion.question}
                </div>
                <div className={`grid gap-4 sm:gap-6 ${currentQuestion.type === 'input' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {currentQuestion.type === 'input' ? (
                        <form onSubmit={(e) => { e.preventDefault(); handleAnswer(inputValue); }}>
                           <input 
                                name="answer" 
                                type="text" 
                                placeholder="Digite sua resposta" 
                                disabled={isAnswered} 
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                className={`w-full p-3 rounded-xl border-4 border-sky-300 text-center ${textTransformClass}`} 
                                style={{fontSize: baseFontSize}}
                            />
                           <button type="submit" disabled={isAnswered} className="mt-4 w-full bg-blue-500 text-white text-2xl font-bold py-3 rounded-xl shadow-lg hover:bg-blue-600 transition disabled:opacity-50">Responder</button>
                        </form>
                    ) : (
                       shuffledOptions.map((option) => {
                            const isHidden = hiddenOptions.includes(option);
                            const isCorrect = option.toLowerCase() === currentQuestion.answer.toLowerCase();
                            let buttonClass = 'bg-white border-sky-300 text-sky-700 hover:border-sky-400';
                            if(isAnswered) {
                                if(isCorrect) buttonClass = 'bg-green-400 border-green-600 text-white';
                                else buttonClass = 'bg-red-400 border-red-600 text-white';
                            }
                           return (
                            <button 
                                key={option} 
                                onClick={() => handleAnswer(option)}
                                disabled={isAnswered}
                                style={{ visibility: isHidden ? 'hidden' : 'visible', fontSize: baseFontSize }}
                                className={`option-button w-full font-bold py-4 px-2 rounded-xl shadow-lg border-b-8 transition-transform transform hover:scale-105 active:scale-98 ${buttonClass} ${textTransformClass}`}
                            >
                                {option}
                            </button>
                           )
                        })
                    )}
                </div>
            </main>
        </div>
    );
};

export default GameScreen;