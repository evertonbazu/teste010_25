
import { APPS_SCRIPT_URL, NOME_DESTE_JOGO } from '../constants';
import { RankingEntry } from '../types';

interface ApiResponse {
    status: 'success' | 'error' | 'not_found';
    message?: string;
    [key: string]: any;
}

async function callAppsScript<T extends ApiResponse,>(action: string, data: object): Promise<T> {
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action, ...data })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json() as T;
    } catch (error) {
        console.error("Error contacting Apps Script:", error);
        return { 
            status: 'error', 
            message: 'Falha de comunicação. Verifique sua conexão.' 
        } as T;
    }
}

export const loginUser = (code: string, password: string) => {
    return callAppsScript<{ status: 'success' | 'error' | 'not_found'; name?: string; turma?: string; message?: string; }>('login', { code, password });
};

export const registerUser = (name: string, turma: string, code: string, password: string) => {
    return callAppsScript<ApiResponse>('register', { name, turma, code, password });
};

export const saveScoreAndGetRanking = (fullName: string, turma: string, score: number, time: number, code: string) => {
    return callAppsScript<{ status: 'success' | 'error'; ranking?: RankingEntry[]; message?: string; }>('saveScoreAndGetRanking', { 
        fullName, 
        turma, 
        score, 
        time,
        nomeDoJogo: NOME_DESTE_JOGO,
        code
    });
};

export const getRanking = () => {
    return callAppsScript<{ status: 'success' | 'error'; ranking?: RankingEntry[]; message?: string; }>('getRanking', { nomeDoJogo: NOME_DESTE_JOGO });
};
