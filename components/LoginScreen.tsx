
import React, { useState, useCallback } from 'react';
import { loginUser, registerUser } from '../services/apiService';
import { User } from '../types';
import Loader from './Loader';

interface LoginScreenProps {
    onLoginSuccess: (user: User) => void;
    onShowRanking: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onShowRanking }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    
    // Login state
    const [loginCode, setLoginCode] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginMessage, setLoginMessage] = useState('');
    const [isLoginLoading, setIsLoginLoading] = useState(false);

    // Register state
    const [regName, setRegName] = useState('');
    const [regClass, setRegClass] = useState('');
    const [regCode, setRegCode] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regMessage, setRegMessage] = useState('');
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    
    const capitalizeName = (name: string) => {
        return name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleLogin = useCallback(async () => {
        if (!loginCode || !loginPassword) {
            setLoginMessage('Preencha o código e a senha.');
            return;
        }
        setLoginMessage('');
        setIsLoginLoading(true);
        const result = await loginUser(loginCode, loginPassword);
        setIsLoginLoading(false);

        if (result.status === 'success' && result.name && result.turma) {
            onLoginSuccess({ name: result.name, code: loginCode, turma: result.turma, firstName: '' });
        } else if (result.status === 'not_found') {
            setRegCode(loginCode);
            setIsRegistering(true);
        } else {
            setLoginMessage(result.message || 'Ocorreu um erro.');
        }
    }, [loginCode, loginPassword, onLoginSuccess]);

    const handleRegister = useCallback(async () => {
        if (!regName || !regClass || !regCode || !regPassword) {
            setRegMessage('Todos os campos são obrigatórios.');
            return;
        }
        setRegMessage('');
        setIsRegisterLoading(true);
        const formattedName = capitalizeName(regName);
        const result = await registerUser(formattedName, regClass, regCode, regPassword);
        setIsRegisterLoading(false);

        if (result.status === 'success') {
            onLoginSuccess({ name: formattedName, code: regCode, turma: regClass, firstName: '' });
        } else {
            setRegMessage(result.message || 'Ocorreu um erro.');
        }
    }, [regName, regClass, regCode, regPassword, onLoginSuccess]);


    const handleKeyPress = <T,>(action: () => void) => (event: React.KeyboardEvent<T>) => {
        if (event.key === 'Enter') {
            action();
        }
    };
    

    return (
        <div className="bg-white/70 p-6 sm:p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            {isRegistering ? (
                 <div id="register-form">
                    <h1 className="text-3xl sm:text-4xl font-bold text-sky-800">Criar Cadastro</h1>
                    <p className="text-lg text-sky-700 mt-4">Preencha seus dados para criar um acesso.</p>
                    <input type="text" value={regName} onChange={e => setRegName(e.target.value)} onKeyDown={handleKeyPress(handleRegister)} placeholder="Nome Completo" className="mt-8 w-full text-xl p-3 rounded-xl border-4 border-sky-300"/>
                    <select value={regClass} onChange={e => setRegClass(e.target.value)} className="mt-4 w-full text-xl p-3 rounded-xl border-4 border-sky-300 bg-white">
                        <option value="">Selecione sua turma</option>
                        <option value="5º Ano A">5º Ano A</option>
                        <option value="5º Ano B">5º Ano B</option>
                    </select>
                    <input type="text" value={regCode} onChange={e => setRegCode(e.target.value)} onKeyDown={handleKeyPress(handleRegister)} placeholder="Código de acesso (Ex.: 36123.16)" className="mt-4 w-full text-xl p-3 rounded-xl border-4 border-sky-300"/>
                    <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} onKeyDown={handleKeyPress(handleRegister)} placeholder="Crie uma senha" className="mt-4 w-full text-xl p-3 rounded-xl border-4 border-sky-300"/>
                    <button onClick={handleRegister} disabled={isRegisterLoading} className="mt-6 w-full bg-green-500 text-white text-2xl font-bold py-3 rounded-xl shadow-lg hover:bg-green-600 transition flex items-center justify-center disabled:bg-green-400">
                        {isRegisterLoading ? <Loader className="w-7 h-7" /> : 'Cadastrar e Entrar'}
                    </button>
                    <p className="text-red-500 mt-4 h-5">{regMessage}</p>
                    <button onClick={() => setIsRegistering(false)} className="mt-2 text-sky-600 hover:underline">Já tenho cadastro</button>
                </div>
            ) : (
                <div id="login-form">
                    <h1 className="text-3xl sm:text-4xl font-bold text-sky-800">Acessar Jogo</h1>
                    <p className="text-lg text-sky-700 mt-4">Digite seu código e senha para entrar.</p>
                    <input type="text" value={loginCode} onChange={e => setLoginCode(e.target.value)} onKeyDown={handleKeyPress(handleLogin)} placeholder="Seu código (Ex.: 36123.16)" className="mt-8 w-full text-xl p-3 rounded-xl border-4 border-sky-300"/>
                    <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} onKeyDown={handleKeyPress(handleLogin)} placeholder="Sua senha" className="mt-4 w-full text-xl p-3 rounded-xl border-4 border-sky-300"/>
                    <button onClick={handleLogin} disabled={isLoginLoading} className="mt-6 w-full bg-blue-500 text-white text-2xl font-bold py-3 rounded-xl shadow-lg hover:bg-blue-600 transition flex items-center justify-center disabled:bg-blue-400">
                        {isLoginLoading ? <Loader className="w-7 h-7" /> : 'Entrar'}
                    </button>
                    <p className="text-red-500 mt-4 h-5">{loginMessage}</p>
                    <div className="flex space-x-2 mt-2">
                        <button onClick={() => setIsRegistering(true)} className="w-1/2 text-sky-600 hover:underline">Não tenho cadastro</button>
                        <button onClick={onShowRanking} className="w-1/2 text-sky-600 hover:underline">Ver Ranking</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginScreen;
